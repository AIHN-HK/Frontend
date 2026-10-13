import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useHttpClient } from '@/shared/api/api-context';
import { session, useSession } from '@/shared/session/session';
import { ApiError } from '@/shared/api/api-error';
import type { AssessmentDraft, AssessmentResult, AssessmentScope } from '../model/assessment.types';
import { readAssessmentResult, readAssessmentSnapshot, readAssessmentAnalysis, readAssessmentQuestions, startAssessment, submitAssessment, readAssessmentConfirmation, readAssessmentHistory } from '../api/assessment.api';

export function useAssessmentHistoryQuery() {
  const http = useHttpClient(), current = useSession();
  return useQuery({
    queryKey: ['assessment', 'history', current.user?.id, current.revision, { limit: 10 }],
    queryFn: ({ signal }) => readAssessmentHistory(http, signal),
    enabled: current.status === 'authenticated',
    retry: false,
  });
}


export function useAssessmentQuestionsQuery() {
  const http = useHttpClient(), current = useSession();
  return useQuery({
    queryKey: ['assessment', 'questions', current.user?.id, current.revision],
    queryFn: ({ signal }) => readAssessmentQuestions(http, signal),
    enabled: current.status === 'authenticated', retry: false, refetchOnWindowFocus: false,
  });
}

type Command = { scope: AssessmentScope; signal: AbortSignal } & (
  { action: 'start' } | { action: 'submit'; draft: AssessmentDraft } | { action: 'check'; attemptId: number }
);
export function isAssessmentScopeCurrent(scope: AssessmentScope, signal: AbortSignal): boolean {
  const current = session.read();
  return !signal.aborted && current.status === 'authenticated' && current.user?.id === scope.ownerId && current.revision === scope.revision;
}
export function useAssessmentCommand() {
  const http = useHttpClient(), queryClient = useQueryClient(), current = useSession();
  return useMutation({
    mutationKey: ['assessment', 'command', current.user?.id, current.revision], retry: false,
    mutationFn: async (command: Command) => {
      const valid = () => { if (!isAssessmentScopeCurrent(command.scope, command.signal)) throw new ApiError('session-changed', 'Phiên đã thay đổi.'); };
      valid();
      const result = command.action === 'start' ? await startAssessment(http, command.scope.ownerId, command.signal)
        : command.action === 'submit' ? await submitAssessment(http, command.draft, command.signal)
        : await readAssessmentConfirmation(http, command.attemptId, command.signal);
      valid(); return result;
    },
    onSuccess: (_result, command) => {
      if (command.action !== 'start' && isAssessmentScopeCurrent(command.scope, command.signal)) {
        void queryClient.invalidateQueries({ queryKey: ['assessment', 'history', command.scope.ownerId, command.scope.revision] });
      }
    },
  });
}


export function useAssessmentResultQuery(attemptId: number | null) {
  const http = useHttpClient(), current = useSession();
  return useQuery({
    queryKey: ['assessment', 'result', current.user?.id, current.revision, attemptId],
    queryFn: ({ signal }) => { if (attemptId === null) throw new Error('Invalid attempt'); return readAssessmentResult(http, attemptId, signal); },
    enabled: current.status === 'authenticated' && attemptId !== null, retry: false, refetchOnWindowFocus: false,
  });
}
export function useAssessmentNormalizationQuery(result: AssessmentResult | undefined) {
  const http = useHttpClient(), current = useSession();
  return useQuery({
    queryKey: ['assessment', 'snapshot', current.user?.id, current.revision, result?.attemptId, result?.scores, result?.topCode],
    queryFn: ({ signal }) => { if (!result) throw new Error('Result not ready'); return readAssessmentSnapshot(http, result, signal); },
    enabled: current.status === 'authenticated' && result !== undefined, retry: false, refetchOnWindowFocus: false,
  });
}
export function useAssessmentAnalysisQuery(attemptId: number | null) {
  const http = useHttpClient(), current = useSession();
  return useQuery({
    queryKey: ['assessment', 'analysis', current.user?.id, current.revision, attemptId],
    queryFn: ({ signal }) => { if (attemptId === null) throw new Error('Invalid attempt'); return readAssessmentAnalysis(http, attemptId, signal); },
    enabled: current.status === 'authenticated' && attemptId !== null, retry: false, refetchOnWindowFocus: false,
  });
}
