import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, Plus, Droplets, Leaf, Edit2, Trash2 } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { toast } from "sonner";

interface JournalEntry {
  id: string;
  date: Date;
  product: string;
  notes: string;
  nextApplicationDate?: Date;
}

export function TreatmentCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
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
        ? new Date(newEntry.nextApplicationDate)
        : undefined,
    };

    setEntries([...entries, entry]);
    setNewEntry({ product: "", notes: "", nextApplicationDate: "" });
    setIsAddingEntry(false);
    toast.success("Treatment entry added!");
  };

  const handleUpdateEntry = () => {
    if (!editingEntry) return;

    setEntries(
      entries.map((e) =>
        e.id === editingEntry.id
          ? {
              ...editingEntry,
              product: newEntry.product.trim() || editingEntry.product,
              notes: newEntry.notes.trim(),
              nextApplicationDate: newEntry.nextApplicationDate
                ? new Date(newEntry.nextApplicationDate)
                : editingEntry.nextApplicationDate,
            }
          : e
      )
    );
    setEditingEntry(null);
    setNewEntry({ product: "", notes: "", nextApplicationDate: "" });
    toast.success("Entry updated!");
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
    toast.success("Entry deleted");
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
              <CardTitle className="flex items-center gap-2 text-lg">
                <Droplets className="w-5 h-5 text-primary" />
                Upcoming Treatments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingTreatments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingTreatments.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 rounded-xl bg-lawn-100 border border-lawn-200"
                    >
                      <p className="font-medium text-foreground text-sm">{entry.product}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(entry.nextApplicationDate!, "MMM d, yyyy")}
                      </p>
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
                            onClick={() => handleDeleteEntry(entry.id)}
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
      </div>
    </section>
  );
}
