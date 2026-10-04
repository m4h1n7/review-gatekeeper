import { Component, useState, type ErrorInfo, type ReactNode } from "react";
import { useCompliance } from "./ComplianceProvider";
import { ExternalService, resolveServiceStatus, ServiceStatus } from "@/lib/serviceRegistry";
import { ShieldAlert } from "lucide-react";

/**
 * Renders a third-party integration ONLY when consent allows it, and renders a
 * clean, accessible fallback otherwise — so a blocked or failed service
 * degrades to a readable message instead of a broken layout.
 *
 * Also doubles as an error boundary: if the third-party child throws, we show
 * the same fallback rather than letting the exception reach the root and blank
 * the page.
 */
interface Props {
  service: ExternalService;
  children: React.ReactNode;
  /** Override the registry's fallback copy. */
  fallback?: string;
}

type State = { status: "ok" | "error" };

export function ConsentGatedService({ service, children, fallback }: Props) {
  const { consent, isHydrated } = useCompliance();
  const [state, setState] = useState<State>({ status: "ok" });

  // Before hydration we do not know consent yet — render nothing rather than
  // guessing, so a blocked script can never flash onto the page.
  if (!isHydrated) return null;

  const status: ServiceStatus = state.status === "error" ? "unavailable" : resolveServiceStatus(service, consent);

  if (status !== "active") {
    return <ServiceFallback service={service} status={status} message={fallback} />;
  }

  return (
    <ErrorBoundary
      fallback={<ServiceFallback service={service} status="unavailable" message={fallback} />}
    >
      {children}
    </ErrorBoundary>
  );
}

/** Accessible placeholder shown when a service is blocked or fails. */
export function ServiceFallback({
  service,
  status,
  message,
}: {
  service: ExternalService;
  status: ServiceStatus;
  message?: string;
}) {
  const blocked = status === "blocked-by-consent";
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-[#A1A1AA] leading-relaxed"
    >
      <p className="flex items-center gap-2 font-medium text-white">
        <ShieldAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        {blocked ? `${service.label} is turned off` : `${service.label} is unavailable`}
      </p>
      <p className="mt-1.5">{message ?? service.fallback}</p>
      {blocked && (
        <p className="mt-1.5 text-[11px] text-white/50">
          You can change this in your cookie preferences at any time.
        </p>
      )}
    </div>
  );
}

/** Minimal error boundary. Kept local so it has no external dependency. */
interface BoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface BoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    /* Swallowed on purpose: a third-party failure must not crash the page. */
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export default ConsentGatedService;
