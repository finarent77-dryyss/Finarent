'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { validateForm } from '@/utils/validation';
import PageTransition from '@/components/animations/PageTransition';
import ScrollReveal from '@/components/animations/ScrollReveal';
import FAQItem from '@/components/ui/FAQItem';
import { useTranslation } from '@/lib/i18n';

const getAmountOption = (amount) => {
  const n = Number(amount);
  if (!n || n < 3000) return '';
  if (n <= 10000) return '3 000€ - 10 000€';
  if (n <= 30000) return '10 000€ - 30 000€';
  if (n <= 50000) return '30 000€ - 50 000€';
  if (n <= 100000) return '50 000€ - 100 000€';
  if (n <= 200000) return '100 000€ - 200 000€';
  if (n <= 500000) return '200 000€ - 500 000€';
  return 'Plus de 500 000€';
};

export default function ContactClient() {
  const searchParams = useSearchParams();
  const fromSimulator = searchParams.get('fromSimulator');
  const amountParam = searchParams.get('amount');
  const durationParam = searchParams.get('duration');
  const monthlyPaymentParam = searchParams.get('monthlyPayment');
  const totalCostParam = searchParams.get('totalCost');
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    requestType: 'financement',
    companyName: '',
    siren: '',
    sector: '',
    amount: '',
    equipmentType: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    consent: false,
    website: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [reference, setReference] = useState(null);

  useEffect(() => {
    if (fromSimulator && amountParam) {
      const simulationMsg = `Simulation : ${Number(amountParam).toLocaleString()}€ sur ${durationParam} mois - Mensualité estimée : ${Number(monthlyPaymentParam || 0).toLocaleString()}€`;
      setFormData(prev => ({
        ...prev,
        requestType: 'financement',
        amount: getAmountOption(amountParam),
        message: prev.message || simulationMsg
      }));
    }
  }, [fromSimulator, amountParam, durationParam, monthlyPaymentParam]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.website) { setSubmitStatus('success'); setReference('DEMO'); return; }
    const validation = validateForm(formData, ['companyName', 'siren', 'sector', 'amount', 'firstName', 'lastName', 'email', 'phone', 'consent']);
    if (!validation.isValid) { setErrors(validation.errors); return; }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setReference(null);
    setErrors({});
    try {
      let recaptchaToken = 'test-token';
      if (typeof window !== 'undefined' && window.grecaptcha?.enterprise?.execute) {
        try {
          recaptchaToken = await window.grecaptcha.enterprise.execute(
            process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
            { action: 'contact_form' }
          );
        } catch (_) {}
      } else if (typeof window !== 'undefined' && window.grecaptcha?.execute) {
        try {
          recaptchaToken = await window.grecaptcha.execute(
            process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
            { action: 'contact_form' }
          );
        } catch (_) {}
      }

      const res = await fetch('/api/financement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: formData.requestType,
          companyName: formData.companyName,
          siren: formData.siren.replace(/\s/g, ''),
          sector: formData.sector,
          amount: formData.amount,
          equipmentType: formData.equipmentType || undefined,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          message: formData.message || undefined,
          consent: formData.consent,
          recaptchaToken,
          website: formData.website,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setSubmitStatus('error');
          setErrors({ _general: data.error || t('contact.errorMessage') });
        }
        return;
      }

      setSubmitStatus('success');
      setReference(data.reference);
      setFormData({ requestType: 'financement', companyName: '', siren: '', sector: '', amount: '', equipmentType: '', firstName: '', lastName: '', email: '', phone: '', message: '', consent: false, website: '' });
    } catch (err) {
      console.error(err);
      setSubmitStatus('error');
      setErrors({ _general: t('contact.errorMessage') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen">
        <section className="pt-28 pb-12 bg-gradient-to-br from-gray-50 via-white to-indigo-50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block px-4 py-2 bg-secondary/10 rounded-full mb-4">
                <span className="text-secondary font-semibold text-sm">{t('contact.badge')}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-4">{t('contact.title')}</h1>
              <p className="text-lg text-gray-600">{t('contact.subtitle')}</p>
            </div>
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                <ScrollReveal>
                  <div className="lg:sticky lg:top-28">
                    <h2 className="text-2xl font-bold text-primary mb-4">{t('contact.whyChooseUs')}</h2>
                    <p className="text-gray-600 mb-6">{t('contact.whyChooseUsDesc')}</p>
                    <div className="space-y-3 mb-6">
                      {[t('contact.response48h'), t('contact.noCommitment'), t('contact.personalSupport'), t('contact.secureData')].map((item, i) => (
                        <div key={i} className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                            <i className="fa-solid fa-check text-white text-xs"></i>
                          </div>
                          <span className="text-gray-700 text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gradient-to-br from-secondary/5 to-accent/5 rounded-xl p-4 border border-secondary/20">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="fa-solid fa-shield-halved text-white"></i>
                        </div>
                        <div>
                          <div className="font-bold text-primary text-sm">{t('contact.dataProtected')}</div>
                          <p className="text-xs text-gray-600">{t('contact.dataProtectedDesc')}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 space-y-2">
                      <h3 className="text-sm font-bold text-primary">{t('contact.needHelp')}</h3>
                      <div className="flex items-center space-x-2">
                        <i className="fa-solid fa-phone text-secondary text-sm"></i>
                        <a href="tel:0123456789" className="text-sm font-medium text-gray-900 hover:text-secondary">{t('common.phone')}</a>
                      </div>
                      <div className="flex items-center space-x-2">
                        <i className="fa-solid fa-envelope text-secondary text-sm"></i>
                        <a href="mailto:contact@finassur.fr" className="text-sm font-medium text-gray-900 hover:text-secondary">{t('common.email')}</a>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={0.2}>
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl p-5 sm:p-6 border border-gray-200">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
                        <input type="text" name="website" value={formData.website} onChange={handleChange} tabIndex="-1" autoComplete="off" />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">{t('contact.requestType')}</label>
                          <select name="requestType" value={formData.requestType} onChange={handleChange} className="input-field py-2.5 text-sm">
                            <option value="financement">{t('contact.financing')}</option>
                            <option value="assurance">{t('contact.insuranceOption')}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">{t('contact.companyName')}</label>
                          <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Ex: SARL Dupont" className={`input-field py-2.5 text-sm ${errors.companyName ? 'border-red-500' : ''}`} />
                          {errors.companyName && <p className="text-red-500 text-xs mt-0.5">{errors.companyName}</p>}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">{t('contact.siren')}</label>
                          <input type="text" name="siren" value={formData.siren} onChange={handleChange} placeholder="123 456 789" className={`input-field py-2.5 text-sm ${errors.siren ? 'border-red-500' : ''}`} />
                          {errors.siren && <p className="text-red-500 text-xs mt-0.5">{errors.siren}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">{t('contact.sector')}</label>
                          <select name="sector" value={formData.sector} onChange={handleChange} className={`input-field py-2.5 text-sm ${errors.sector ? 'border-red-500' : ''}`}>
                            <option value="">{t('common.select')}</option>
                            <option>{t('contact.sectorBtp')}</option>
                            <option>{t('contact.sectorMedical')}</option>
                            <option>{t('contact.sectorIt')}</option>
                            <option>{t('contact.sectorTransport')}</option>
                            <option>{t('contact.sectorIndustry')}</option>
                            <option>{t('contact.sectorServices')}</option>
                            <option>{t('common.other')}</option>
                          </select>
                          {errors.sector && <p className="text-red-500 text-xs mt-0.5">{errors.sector}</p>}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">{t('contact.amount')}</label>
                          <select name="amount" value={formData.amount} onChange={handleChange} className={`input-field py-2.5 text-sm ${errors.amount ? 'border-red-500' : ''}`}>
                            <option value="">{t('common.select')}</option>
                            <option>3 000€ - 10 000€</option>
                            <option>10 000€ - 30 000€</option>
                            <option>30 000€ - 50 000€</option>
                            <option>50 000€ - 100 000€</option>
                            <option>100 000€ - 200 000€</option>
                            <option>200 000€ - 500 000€</option>
                            <option>{t('contact.moreThan500k')}</option>
                          </select>
                          {errors.amount && <p className="text-red-500 text-xs mt-0.5">{errors.amount}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">{t('contact.equipmentType')}</label>
                          <select name="equipmentType" value={formData.equipmentType} onChange={handleChange} className="input-field py-2.5 text-sm">
                            <option value="">{t('common.select')}</option>
                            <option value="vehicule">{t('contact.vehicle')}</option>
                            <option value="informatique">{t('contact.itEquipment')}</option>
                            <option value="medical">{t('contact.medicalEquipment')}</option>
                            <option value="btp">{t('contact.btpEquipment')}</option>
                            <option value="industriel">{t('contact.industrialMachines')}</option>
                            <option value="autre">{t('common.other')}</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">{t('contact.firstName')}</label>
                          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Jean" className={`input-field py-2.5 text-sm ${errors.firstName ? 'border-red-500' : ''}`} />
                          {errors.firstName && <p className="text-red-500 text-xs mt-0.5">{errors.firstName}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">{t('contact.lastName')}</label>
                          <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Dupont" className={`input-field py-2.5 text-sm ${errors.lastName ? 'border-red-500' : ''}`} />
                          {errors.lastName && <p className="text-red-500 text-xs mt-0.5">{errors.lastName}</p>}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">{t('contact.emailLabel')}</label>
                          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="jean.dupont@entreprise.fr" className={`input-field py-2.5 text-sm ${errors.email ? 'border-red-500' : ''}`} />
                          {errors.email && <p className="text-red-500 text-xs mt-0.5">{errors.email}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">{t('contact.phoneLabel')}</label>
                          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="06 12 34 56 78" className={`input-field py-2.5 text-sm ${errors.phone ? 'border-red-500' : ''}`} />
                          {errors.phone && <p className="text-red-500 text-xs mt-0.5">{errors.phone}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">{t('contact.message')}</label>
                        <textarea name="message" value={formData.message} onChange={handleChange} rows="3" placeholder={t('contact.messagePlaceholder')} className="input-field py-2.5 text-sm resize-none"></textarea>
                      </div>

                      <div className="flex items-start space-x-2">
                        <input type="checkbox" id="consent" name="consent" checked={formData.consent} onChange={handleChange} className={`mt-0.5 h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary ${errors.consent ? 'border-red-500' : ''}`} />
                        <label htmlFor="consent" className="text-xs text-gray-600">
                          {t('contact.consent')} <Link href="/privacy" className="text-secondary hover:underline font-medium">{t('contact.privacyPolicy')}</Link> *
                        </label>
                      </div>
                      {errors.consent && <p className="text-red-500 text-xs">{errors.consent}</p>}

                      <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>{t('contact.sending')}</> : <><span>{t('contact.submit')}</span><i className="fa-solid fa-arrow-right ml-2"></i></>}
                      </button>

                      {errors._general && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-800 text-sm">
                          <i className="fa-solid fa-exclamation-circle mr-2"></i>{errors._general}
                        </div>
                      )}
                      {submitStatus === 'success' && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-800 text-sm">
                          <i className="fa-solid fa-check-circle mr-2"></i>
                          {t('contact.successPrefix')} {reference ? `(${reference}) ` : ''}{t('contact.successMessage')}
                        </div>
                      )}
                      {submitStatus === 'error' && !errors._general && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-800 text-sm">
                          <i className="fa-solid fa-exclamation-circle mr-2"></i>{t('contact.errorMessage')}
                        </div>
                      )}
                    </form>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-primary">{t('contact.faqTitle')}</h2>
              </div>
              <div className="space-y-3">
                <FAQItem question={t('contact.faq1Q')} answer={t('contact.faq1A')} />
                <FAQItem question={t('contact.faq2Q')} answer={t('contact.faq2A')} />
                <FAQItem question={t('contact.faq3Q')} answer={t('contact.faq3A')} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
