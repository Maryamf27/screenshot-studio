"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import {useTranslations} from 'next-intl';

type StepNavigationProps = {
  onBack: () => void;
  onContinue: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  className?: string;
};

export function StepNavigation({ onBack, onContinue, continueLabel = "Continue", continueDisabled = false, className = "" }: StepNavigationProps) {
  const t = useTranslations('common');
  return (
    <div className={`flex items-center justify-between gap-3 border-t border-slate-200 pt-5 ${className}`}>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />{t('back')}
      </button>
      <button
        type="button"
        onClick={onContinue}
        disabled={continueDisabled}
        className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-slate-800 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        {continueLabel === 'Continue' ? t('continue') : continueLabel === 'Next' ? t('next') : continueLabel}<ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
