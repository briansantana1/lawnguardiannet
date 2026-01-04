import { useState, useCallback } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, Plus, Droplets, Leaf, Edit2, Trash2, Bell, BellRing } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { NotificationScheduler } from "@/components/NotificationScheduler";

function parseDateInput(value: string): Date {
  // HTML date inputs return YYYY-MM-DD; parsing via new Date(value) treats it as UTC and can shift a day.
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0, 0); // noon local to avoid TZ edge cases
}

interface JournalEntry {
  id: string;
  date: Date;
  product: string;
  notes: string;
  nextApplicationDate?: Date;
  notificationEnabled?: boolean;
}

interface UndoState {
  type: "delete" | "edit";
  entry: JournalEntry;
  previousEntry?: JournalEntry;
}

export function TreatmentCalendar() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [deleteConfirmEntry, setDeleteConfirmEntry] = useState<JournalEntry | null>(null);
  const [undoState, setUndoState] = useState<UndoState | null>(null);
  const [notificationModalEntry, setNotificationModalEntry] = useState<JournalEntry | null>(null);
  const [newEntry, setNewEntry] = useState({
    product: "",
    notes: "",
    nextApplicationDate: "",
  });

  const entriesForDate = selectedDate
    ? entries.filter((entry) => isSameDay(entry.date, selectedDate))
    : [];

  const upcomingTreatments = entries
    .filter((entry) => entry.nextApplicationDate && entry.nextApplicationDate >= new Date())
    .sort((a, b) => (a.nextApplicationDate!.getTime() - b.nextApplicationDate!.getTime()))
    .slice(0, 5);

  const handleAddEntry = () => {
    if (!selectedDate || !newEntry.product.trim()) {
      toast.error("Please select a date and enter a product name");
      return;
    }

    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      product: newEntry.product.trim(),
      notes: newEntry.notes.trim(),
      nextApplicationDate: newEntry.nextApplicationDate
        ? parseDateInput(newEntry.nextApplicationDate)
        : undefined,
      notificationEnabled: false,
    };

    setEntries([...entries, entry]);
    setNewEntry({ product: "", notes: "", nextApplicationDate: "" });
    setIsAddingEntry(false);
    toast.success("Treatment entry added!");
  };

  const handleUpdateEntry = () => {
    if (!editingEntry) return;

    const previousEntry = entries.find((e) => e.id === editingEntry.id);
    const updatedEntry = {
      ...editingEntry,
      product: newEntry.product.trim() || editingEntry.product,
      notes: newEntry.notes.trim(),
      nextApplicationDate: newEntry.nextApplicationDate
        ? parseDateInput(newEntry.nextApplicationDate)
        : editingEntry.nextApplicationDate,
    };

    setEntries(
      entries.map((e) => (e.id === editingEntry.id ? updatedEntry : e))
    );

    // Save undo state
    if (previousEntry) {
      setUndoState({
        type: "edit",
        entry: updatedEntry,
        previousEntry: { ...previousEntry },
      });

      toast.success("Entry updated!", {
        action: {
          label: "Undo",
          onClick: () => handleUndo(),
        },
        duration: 5000,
      });
    }

    setEditingEntry(null);
    setNewEntry({ product: "", notes: "", nextApplicationDate: "" });
  };

  const handleDeleteEntry = (entry: JournalEntry) => {
    setDeleteConfirmEntry(entry);
  };

  const confirmDelete = () => {
    if (!deleteConfirmEntry) return;

    const deletedEntry = { ...deleteConfirmEntry };
    setEntries(entries.filter((e) => e.id !== deleteConfirmEntry.id));
    setDeleteConfirmEntry(null);

    // Save undo state
    setUndoState({
      type: "delete",
      entry: deletedEntry,
    });

    toast.success("Entry deleted", {
      action: {
        label: "Undo",
        onClick: () => handleUndo(),
      },
      duration: 5000,
    });
  };

  const handleUndo = useCallback(() => {
    if (!undoState) return;

    if (undoState.type === "delete") {
      // Restore deleted entry
      setEntries((prev) => [...prev, undoState.entry]);
      toast.success("Entry restored!");
    } else if (undoState.type === "edit" && undoState.previousEntry) {
      // Restore previous version
      setEntries((prev) =>
        prev.map((e) =>
          e.id === undoState.entry.id ? undoState.previousEntry! : e
        )
      );
      toast.success("Changes reverted!");
    }

    setUndoState(null);
  }, [undoState]);

  const handleScheduleNotification = (entry: JournalEntry) => {
    if (!user) {
      toast.error("Please sign in to enable notifications");
      return;
    }

    if (!entry.nextApplicationDate) {
      toast.error("No next application date set for this treatment");
      return;
    }

    setNotificationModalEntry(entry);
  };

  const handleNotificationSuccess = () => {
    if (notificationModalEntry) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === notificationModalEntry.id ? { ...e, notificationEnabled: true } : e
        )
      );
    }
  };

  const handleEnableAllNotifications = async () => {
    if (!user) {
      toast.error("Please sign in to enable notifications");
      return;
    }

    const treatmentsWithDates = entries.filter(
      (e) => e.nextApplicationDate && e.nextApplicationDate >= new Date() && !e.notificationEnabled
    );

    if (treatmentsWithDates.length === 0) {
      toast.info("No upcoming treatments to schedule notifications for");
      return;
    }

    let successCount = 0;
    for (const entry of treatmentsWithDates) {
      try {
        await handleScheduleNotification(entry);
        successCount++;
      } catch {
        console.error("Failed to schedule for", entry.product);
      }
    }

    if (successCount > 0) {
      toast.success(`Enabled notifications for ${successCount} treatments`);
    }
  };

  const datesWithEntries = entries.map((e) => e.date);
  const datesWithUpcoming = entries
    .filter((e) => e.nextApplicationDate)
    .map((e) => e.nextApplicationDate!);

  return (
    <section id="calendar" className="py-20 bg-lawn-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <CalendarDays className="w-4 h-4" />
            Treatment Tracker
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Lawn Care Calendar
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track products applied to your lawn, record when treatments were made, and schedule upcoming applications.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Calendar */}
          <Card variant="elevated" className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Select a Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-xl border-0 mx-auto"
                modifiers={{
                  hasEntry: datesWithEntries,
                  hasUpcoming: datesWithUpcoming,
                }}
                modifiersStyles={{
                  hasEntry: {
                    backgroundColor: "hsl(var(--primary) / 0.2)",
                    borderRadius: "50%",
                  },
                  hasUpcoming: {
                    border: "2px solid hsl(var(--primary))",
                    borderRadius: "50%",
                  },
                }}
              />

              <div className="flex items-center gap-6 mt-6 justify-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary/20" />
                  <span className="text-muted-foreground">Has entries</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-primary" />
                  <span className="text-muted-foreground">Upcoming treatment</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Treatments */}
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Droplets className="w-5 h-5 text-primary" />
                  Upcoming Treatments
                </CardTitle>
                {upcomingTreatments.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEnableAllNotifications}
                    className="text-xs"
                    disabled={!user}
                  >
                    <BellRing className="w-3 h-3 mr-1" />
                    Enable All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {upcomingTreatments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingTreatments.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 rounded-xl bg-lawn-100 border border-lawn-200"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">
                            {entry.product}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(entry.nextApplicationDate!, "MMM d, yyyy")}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleScheduleNotification(entry)}
                            disabled={entry.notificationEnabled}
                            title={entry.notificationEnabled ? "Notification enabled" : "Schedule notification"}
                          >
                            {entry.notificationEnabled ? (
                              <BellRing className="w-3.5 h-3.5 text-primary" />
                            ) : (
                              <Bell className="w-3.5 h-3.5" />
                            )}
                          </Button>
                          <Dialog
                            open={editingEntry?.id === entry.id}
                            onOpenChange={(open) => {
                              if (open) {
                                setEditingEntry(entry);
                                setNewEntry({
                                  product: entry.product,
                                  notes: entry.notes,
                                  nextApplicationDate: entry.nextApplicationDate
                                    ? format(entry.nextApplicationDate, "yyyy-MM-dd")
                                    : "",
                                });
                              } else {
                                setEditingEntry(null);
                                setNewEntry({ product: "", notes: "", nextApplicationDate: "" });
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Treatment</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <div>
                                  <Label htmlFor="edit-upcoming-product">Product Applied</Label>
                                  <Input
                                    id="edit-upcoming-product"
                                    value={newEntry.product}
                                    onChange={(e) =>
                                      setNewEntry({ ...newEntry, product: e.target.value })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-upcoming-notes">Notes</Label>
                                  <Textarea
                                    id="edit-upcoming-notes"
                                    value={newEntry.notes}
                                    onChange={(e) =>
                                      setNewEntry({ ...newEntry, notes: e.target.value })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-upcoming-nextDate">Next Application Date</Label>
                                  <Input
                                    id="edit-upcoming-nextDate"
                                    type="date"
                                    value={newEntry.nextApplicationDate}
                                    onChange={(e) =>
                                      setNewEntry({ ...newEntry, nextApplicationDate: e.target.value })
                                    }
                                  />
                                </div>
                                <Button onClick={handleUpdateEntry} variant="scan" className="w-full">
                                  Update Entry
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleDeleteEntry(entry)}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No upcoming treatments scheduled
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Entries */}
        {selectedDate && (
          <Card variant="elevated" className="max-w-4xl mx-auto mt-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-primary" />
                {format(selectedDate, "MMMM d, yyyy")}
              </CardTitle>
              <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
                <DialogTrigger asChild>
                  <Button variant="scan" size="sm">
                    <Plus className="w-4 h-4" />
                    Add Entry
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Treatment Entry</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="product">Product Applied</Label>
                      <Input
                        id="product"
                        placeholder="e.g., Scotts Turf Builder"
                        value={newEntry.product}
                        onChange={(e) =>
                          setNewEntry({ ...newEntry, product: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Application details, weather conditions, coverage area..."
                        value={newEntry.notes}
                        onChange={(e) =>
                          setNewEntry({ ...newEntry, notes: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="nextDate">Next Application Date (Optional)</Label>
                      <Input
                        id="nextDate"
                        type="date"
                        value={newEntry.nextApplicationDate}
                        onChange={(e) =>
                          setNewEntry({ ...newEntry, nextApplicationDate: e.target.value })
                        }
                      />
                    </div>
                    <Button onClick={handleAddEntry} variant="scan" className="w-full">
                      Save Entry
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {entriesForDate.length > 0 ? (
                <div className="space-y-4">
                  {entriesForDate.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 rounded-xl bg-lawn-50 border border-lawn-200"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">{entry.product}</h4>
                          {entry.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>
                          )}
                          {entry.nextApplicationDate && (
                            <p className="text-xs text-primary mt-2 font-medium">
                              Next application: {format(entry.nextApplicationDate, "MMM d, yyyy")}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {entry.nextApplicationDate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleScheduleNotification(entry)}
                              disabled={entry.notificationEnabled}
                              title={entry.notificationEnabled ? "Notification enabled" : "Schedule notification"}
                            >
                              {entry.notificationEnabled ? (
                                <BellRing className="w-4 h-4 text-primary" />
                              ) : (
                                <Bell className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                          <Dialog
                            open={editingEntry?.id === entry.id}
                            onOpenChange={(open) => {
                              if (open) {
                                setEditingEntry(entry);
                                setNewEntry({
                                  product: entry.product,
                                  notes: entry.notes,
                                  nextApplicationDate: entry.nextApplicationDate
                                    ? format(entry.nextApplicationDate, "yyyy-MM-dd")
                                    : "",
                                });
                              } else {
                                setEditingEntry(null);
                                setNewEntry({ product: "", notes: "", nextApplicationDate: "" });
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Entry</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <div>
                                  <Label htmlFor="edit-product">Product Applied</Label>
                                  <Input
                                    id="edit-product"
                                    value={newEntry.product}
                                    onChange={(e) =>
                                      setNewEntry({ ...newEntry, product: e.target.value })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-notes">Notes</Label>
                                  <Textarea
                                    id="edit-notes"
                                    value={newEntry.notes}
                                    onChange={(e) =>
                                      setNewEntry({ ...newEntry, notes: e.target.value })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-nextDate">Next Application Date</Label>
                                  <Input
                                    id="edit-nextDate"
                                    type="date"
                                    value={newEntry.nextApplicationDate}
                                    onChange={(e) =>
                                      setNewEntry({ ...newEntry, nextApplicationDate: e.target.value })
                                    }
                                  />
                                </div>
                                <Button onClick={handleUpdateEntry} variant="scan" className="w-full">
                                  Update Entry
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEntry(entry)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No entries for this date</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click "Add Entry" to log a treatment
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirmEntry} onOpenChange={(open) => !open && setDeleteConfirmEntry(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Treatment Entry?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{deleteConfirmEntry?.product}"? This action can be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setDeleteConfirmEntry(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Notification Scheduler Modal */}
        <NotificationScheduler
          open={!!notificationModalEntry}
          onOpenChange={(open) => !open && setNotificationModalEntry(null)}
          treatment={notificationModalEntry ? {
            id: notificationModalEntry.id,
            product: notificationModalEntry.product,
            applicationDate: notificationModalEntry.nextApplicationDate!,
            notes: notificationModalEntry.notes,
          } : null}
          onSuccess={handleNotificationSuccess}
        />
      </div>
    </section>
  );
}
