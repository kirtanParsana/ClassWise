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
} from '@/components/ui/dialog';
import { Bot, Lightbulb, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Conflict } from '@/lib/types';
import { mockSchedule } from '@/lib/data';
import { resolveSchedulingConflicts, ResolveSchedulingConflictsInput } from '@/ai/flows/resolve-scheduling-conflicts';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';

interface ConflictResolverProps {
  conflict: Conflict;
}

type SuggestedSolutions = {
    suggestedSolutions: string;
    reasoning: string;
};

export function ConflictResolver({ conflict }: ConflictResolverProps) {
  const [solutions, setSolutions] = useState<SuggestedSolutions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleResolveConflict = async () => {
    setIsLoading(true);
    setSolutions(null);

    const input: ResolveSchedulingConflictsInput = {
      conflictDescription: conflict.description,
      currentTimetable: JSON.stringify(mockSchedule),
    };

    try {
      const result = await resolveSchedulingConflicts(input);
      // The AI output is a JSON string, so we parse it.
      const parsedSolutions = JSON.parse(result.suggestedSolutions);
      setSolutions({
        suggestedSolutions: parsedSolutions,
        reasoning: result.reasoning
      });

    } catch (error) {
      console.error("Error resolving conflict:", error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not get resolutions from the AI. Please check the format of the AI response.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setSolutions(null);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetState(); setIsOpen(open); }}>
      <Button onClick={() => setIsOpen(true)} size="sm" variant="outline">
        <Bot className="mr-2 h-4 w-4" />
        Resolve with AI
      </Button>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline">AI Conflict Resolution</DialogTitle>
          <DialogDescription>
            {conflict.description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!isLoading && !solutions && (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-secondary/50 rounded-lg">
                <Lightbulb className="h-10 w-10 text-primary mb-4" />
                <p className="text-muted-foreground">Click the button below to ask the AI for potential solutions.</p>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4 text-muted-foreground">AI is searching for solutions...</p>
            </div>
          )}

          {solutions && (
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle className='font-headline'>Suggested Solutions</AlertTitle>
              <AlertDescription>
                <ScrollArea className="h-48">
                  <div className="space-y-4 p-1">
                    <p className="font-semibold">Solutions:</p>
                    <pre className="text-xs bg-muted p-2 rounded-md whitespace-pre-wrap font-code">{JSON.stringify(solutions.suggestedSolutions, null, 2)}</pre>
                    <p className="font-semibold pt-2">Reasoning:</p>
                    <p className="text-sm">{solutions.reasoning}</p>
                  </div>
                </ScrollArea>
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleResolveConflict} disabled={isLoading}>
            {isLoading ? 'Finding Solutions...' : 'Find Solutions'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
