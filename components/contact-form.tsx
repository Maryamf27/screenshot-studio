"use client";

import {useState, type FormEvent} from 'react';
import {useTranslations} from 'next-intl';

export function ContactForm() {
  const t = useTranslations('contact');
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('');
    const form = event.currentTarget;
    const data = new FormData(form);
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    if (!serviceId || !templateId || !publicKey) {setStatus(t('notConfigured')); return;}
    setSending(true);
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({service_id: serviceId, template_id: templateId, user_id: publicKey, template_params: {
          from_name: data.get('name'), reply_to: data.get('email'), subject: data.get('subject'), message: data.get('message')
        }})
      });
      if (!response.ok) throw new Error(t('failed'));
      form.reset(); setStatus(t('sent'));
    } catch {setStatus(t('failed'));}
    finally {setSending(false);}
  }

  const inputClass = 'mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 font-normal outline-none focus:border-primary focus:ring-2 focus:ring-ring/20';
  return <form onSubmit={handleSubmit} className="space-y-5">
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="space-y-2 text-sm font-medium">{t('name')}<input required name="name" autoComplete="name" className={inputClass}/></label>
      <label className="space-y-2 text-sm font-medium">{t('email')}<input required type="email" name="email" autoComplete="email" className={inputClass}/></label>
    </div>
    <label className="block text-sm font-medium">{t('subject')}<input required name="subject" className={inputClass}/></label>
    <label className="block text-sm font-medium">{t('message')}<textarea required name="message" rows={5} className={`${inputClass} resize-y`}/></label>
    <button disabled={sending} className="cursor-pointer rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{sending ? t('sending') : t('send')}</button>
    <p aria-live="polite" className="text-sm text-muted-foreground">{status}</p>
  </form>;
}
