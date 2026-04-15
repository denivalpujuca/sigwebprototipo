import * as React from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { MaterialIcon } from '@/components/Icon';

type ToastVariant = 'success' | 'error' | 'destructive';

type ToastItem = { id: number; message: string; variant: ToastVariant };

type ConfirmOptions = {
	title: string;
	description?: string;
	confirmLabel?: string;
	cancelLabel?: string;
};

type AppFeedbackContextValue = {
	toast: {
		success: (message: string) => void;
		error: (message: string) => void;
		destructive: (message: string) => void;
	};
	confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const AppFeedbackContext = React.createContext<AppFeedbackContextValue | null>(null);

let toastId = 0;

export function AppFeedbackProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = React.useState<ToastItem[]>([]);
	const [confirmOpen, setConfirmOpen] = React.useState(false);
	const [confirmOpts, setConfirmOpts] = React.useState<ConfirmOptions>({ title: '' });
	const confirmResolverRef = React.useRef<((value: boolean) => void) | null>(null);

	const removeToast = React.useCallback((id: number) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const pushToast = React.useCallback((message: string, variant: ToastVariant) => {
		const id = ++toastId;
		setToasts((prev) => [...prev, { id, message, variant }]);
		window.setTimeout(() => removeToast(id), 4200);
	}, [removeToast]);

	const toast = React.useMemo(
		() => ({
			success: (message: string) => pushToast(message, 'success'),
			error: (message: string) => pushToast(message, 'error'),
			destructive: (message: string) => pushToast(message, 'destructive'),
		}),
		[pushToast],
	);

	const confirm = React.useCallback((options: ConfirmOptions) => {
		return new Promise<boolean>((resolve) => {
			confirmResolverRef.current = resolve;
			setConfirmOpts({
				title: options.title,
				description: options.description,
				confirmLabel: options.confirmLabel ?? 'Sim, excluir',
				cancelLabel: options.cancelLabel ?? 'Cancelar',
			});
			setConfirmOpen(true);
		});
	}, []);

	const finishConfirm = React.useCallback((result: boolean) => {
		const r = confirmResolverRef.current;
		if (!r) return;
		confirmResolverRef.current = null;
		setConfirmOpen(false);
		r(result);
	}, []);

	const onDialogOpenChange = React.useCallback((open: boolean) => {
		if (!open) {
			const r = confirmResolverRef.current;
			confirmResolverRef.current = null;
			if (r) r(false);
			setConfirmOpen(false);
		}
	}, []);

	const value = React.useMemo(() => ({ toast, confirm }), [toast, confirm]);

	return (
		<AppFeedbackContext.Provider value={value}>
			{children}
			<div className="fixed bottom-6 right-6 z-[100] flex max-w-sm flex-col gap-2 pointer-events-none">
				{toasts.map((t) => (
					<div
						key={t.id}
						role="status"
						className={cn(
							'pointer-events-auto rounded-lg border px-4 py-3 text-sm font-medium shadow-lg animate-in slide-in-from-right-5 fade-in duration-300',
							t.variant === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-900',
							t.variant === 'error' && 'border-red-200 bg-red-50 text-red-900',
							t.variant === 'destructive' && 'border-red-300 bg-red-50 text-red-700',
						)}
					>
						{t.message}
					</div>
				))}
			</div>
			<Dialog open={confirmOpen} onOpenChange={onDialogOpenChange}>
				<DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
					<DialogHeader className="flex flex-row items-center gap-3">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
							<MaterialIcon name="warning" size={20} className="text-amber-600" />
						</div>
						<DialogTitle>{confirmOpts.title}</DialogTitle>
					</DialogHeader>
					{confirmOpts.description ? <DialogDescription>{confirmOpts.description}</DialogDescription> : null}
					<DialogFooter className="gap-2 sm:gap-0">
						<button
							type="button"
							onClick={() => finishConfirm(false)}
							className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
						>
							{confirmOpts.cancelLabel}
						</button>
						<button
							type="button"
							onClick={() => finishConfirm(true)}
							className="inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
						>
							{confirmOpts.confirmLabel}
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</AppFeedbackContext.Provider>
	);
}

export function useAppFeedback(): AppFeedbackContextValue {
	const ctx = React.useContext(AppFeedbackContext);
	if (!ctx) {
		throw new Error('useAppFeedback deve ser usado dentro de AppFeedbackProvider');
	}
	return ctx;
}
