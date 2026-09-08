import { Component, type ErrorInfo, type ReactNode } from 'react';
import { sanitizeError } from '@/observability/errorSanitizer';
import { telemetryClient } from '@/observability/telemetryClient';

interface ExplorationRecoveryBoundaryProps {
  children: ReactNode;
  resetKey: string;
  onReset: () => void;
  onOpenQuickPortfolio: () => void;
}

interface ExplorationRecoveryBoundaryState {
  hasError: boolean;
}

export class ExplorationRecoveryBoundary extends Component<
  ExplorationRecoveryBoundaryProps,
  ExplorationRecoveryBoundaryState
> {
  state: ExplorationRecoveryBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ExplorationRecoveryBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Exploration rendering failed', error, info.componentStack);
    telemetryClient.track({
      type: 'client_error',
      source: 'react-boundary',
      ...sanitizeError(error),
    });
  }

  componentDidUpdate(previousProps: ExplorationRecoveryBoundaryProps) {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    this.props.onReset();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main
        className="fixed inset-0 z-[900] flex items-center justify-center bg-[#02070d] px-6 text-center text-white"
        role="alert"
      >
        <section aria-labelledby="exploration-recovery-heading" className="max-w-xl">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-amber-300">
            Mission recovery mode
          </p>
          <h1 id="exploration-recovery-heading" className="mt-4 font-heading text-3xl tracking-[0.08em]">
            Exploration paused safely
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/65">
            The immersive renderer stopped unexpectedly. Return to route selection to try again, or open the complete portfolio without WebGL.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={this.handleReset}
              className="min-h-12 rounded-md bg-orange-400 px-6 font-heading text-sm tracking-[0.1em] text-slate-950 hover:bg-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Return to route selection
            </button>
            <button
              type="button"
              onClick={this.props.onOpenQuickPortfolio}
              className="min-h-12 rounded-md border border-cyan-200/40 px-6 font-heading text-sm tracking-[0.1em] text-cyan-100 hover:bg-cyan-200/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
            >
              Open Quick Portfolio
            </button>
          </div>
        </section>
      </main>
    );
  }
}
