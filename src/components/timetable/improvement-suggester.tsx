'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Lightbulb, Loader2 } from 'lucide-react';
import { suggestTimetableImprovements, TimetableInput } from '@/ai/flows/suggest-timetable-improvements';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import { ScheduleEntry } from '@/lib/types';

interface ImprovementSuggesterProps {
  schedule: ScheduleEntry[];
}

export function ImprovementSuggester({ schedule }: ImprovementSuggesterProps) {
  const [issues, setIssues] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSuggestImprovements = async () => {
    setIsLoading(true);
    setSuggestions([]);

    const input: TimetableInput = {
      timetableData: JSON.stringify(schedule),
      constraints: "Standard university constraints: no faculty/room overlaps, labs in lab rooms, respect capacity.",
      currentIssues: issues,
    };

    try {
      const result = await suggestTimetableImprovements(input);
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error("Error suggesting improvements:", error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not get suggestions from the AI. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setIssues('');
    setSuggestions([]);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetState(); setIsOpen(open); }}>
      <DialogTrigger asChild>
        <Button>
          <Bot className="mr-2 h-4 w-4" />
          Get AI Suggestions
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline">AI Timetable Improvement</DialogTitle>
          <DialogDescription>
            Let our AI analyze the current timetable and suggest optimizations.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="issues">Describe any known issues (optional)</Label>
            <Textarea
              id="issues"
              placeholder="e.g., 'Dr. Reed has back-to-back classes across campus', 'CS101 is always overcrowded'."
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
            />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4 text-muted-foreground">AI is thinking...</p>
            </div>
          )}

          {suggestions.length > 0 && (
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle className='font-headline'>Suggestions</AlertTitle>
              <AlertDescription>
                <ScrollArea className="h-40">
                  <ul className="list-disc space-y-2 pl-5 mt-2">
                    {suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </ScrollArea>
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSuggestImprovements} disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Analyze Timetable'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
