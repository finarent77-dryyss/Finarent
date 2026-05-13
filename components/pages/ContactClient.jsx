'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { validateForm } from '@/utils/validation';
import PageTransition from '@/components/animations/PageTransition';
import ScrollReveal from '@/components/animations/ScrollReveal';
import FAQItem from '@/components/ui/FAQItem';
import { useTranslation } from '@/lib/i18n';
import { buildPrefillFromParams } from '@/lib/simulators/prefill';

// Mapping secteur wizard → option du select de /contact (libellés différents)
const CONTACT_SECTOR_MAP = {
  'BTP & Construction': 'btp',
  'Médical & Santé': 'medical',
  'Informatique & Tech': 'tech',
  'Transport & Logistique': 'transport',
  'Industrie': 'industrie',
  'Services': 'services',
  'Commerce': 'commerce',
  'Autre': 'autre',
};

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
  const prefill = useMemo(() => buildPrefillFromParams(searchParams), [searchParams]);
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
    if (!prefill) return;
    const isRcPro = prefill.productType === 'RC_PRO';
    const numericAmount = isRcPro ? prefill.ca : prefill.amount;
    const amountOption = getAmountOption(numericAmount);
    const sectorOption = isRcPro ? CONTACT_SECTOR_MAP[prefill.sector_rcpro] || '' : '';
    setFormData(prev => ({
      ...prev,
      requestType: isRcPro ? 'assurance' : 'financement',
      amount: amountOption || prev.amount,
      equipmentType: !isRcPro && prefill.equipmentType ? prefill.equipmentType : prev.equipmentType,
      sector: sectorOption || prev.sector,
      message: prev.message || prefill.description || '',
    }));
  }, [prefill]);

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
        <section className="pt-28 pb-12 bg-gradient-to-br from-gray-50 via-white to-slate-100">
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

        {/* 3 contact cards */}
        <section className="py-8 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-4">
              {[
                { icon: 'fa-phone', title: 'Téléphone', value: t('common.phone'), sub: 'Lun-Ven 9h-18h', href: 'tel:0123456789', color: 'from-secondary to-secondary/80' },
                { icon: 'fa-envelope', title: 'Email', value: 'contact@finarent.fr', sub: 'Réponse sous 1h ouvrée', href: 'mailto:contact@finarent.fr', color: 'from-accent to-emerald-700' },
                { icon: 'fa-location-dot', title: 'Adresse', value: '12 rue de la République', sub: '75011 Paris', href: '#map', color: 'from-primary to-[#0A2540]' },
              ].map((c, i) => (
                <ScrollReveal key={i} delay={i * 0.07}>
                  <a href={c.href} className="group flex items-start gap-4 p-5 bg-white rounded-2xl shadow-md hover:shadow-2xl border border-gray-100 hover:border-secondary/30 hover:-translate-y-1 transition-all duration-300">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform`}>
                      <i className={`fa-solid ${c.icon} text-lg`}></i>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-0.5">{c.title}</div>
                      <div className="font-bold text-primary text-sm group-hover:text-secondary transition-colors truncate">{c.value}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{c.sub}</div>
                    </div>
                  </a>
                </ScrollReveal>
              ))}
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
                        <a href="mailto:contact@finarent.fr" className="text-sm font-medium text-gray-900 hover:text-secondary">{t('common.email')}</a>
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

        {/* Map + adresse */}
        <section id="map" className="py-12 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-block px-3 py-1.5 bg-accent/10 rounded-full mb-3">
                  <span className="text-accent font-bold text-xs uppercase tracking-widest">Nous rencontrer</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Notre bureau parisien</h2>
                <p className="text-gray-600">Rendez-vous physique sur demande, du lundi au vendredi.</p>
              </div>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-xl border border-gray-100 aspect-video lg:aspect-auto lg:min-h-[400px]">
                  <iframe
                    src="https://www.openstreetmap.org/export/embed.html?bbox=2.3690%2C48.8550%2C2.3850%2C48.8650&amp;layer=mapnik&amp;marker=48.8600%2C2.3770"
                    className="w-full h-full border-0"
                    loading="lazy"
                    title="Localisation Finarent — République, Paris"
                  ></iframe>
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-primary to-[#0A2540] rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <i className="fa-solid fa-location-dot text-accent"></i>
                      </div>
                      <h3 className="font-bold text-lg">Finarent</h3>
                    </div>
                    <div className="space-y-2 text-sm text-white/80">
                      <div className="flex items-start gap-2">
                        <i className="fa-solid fa-building text-accent text-xs mt-1"></i>
                        <span>12 rue de la République<br />75011 Paris</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-train text-accent text-xs"></i>
                        <span>Métro République (3, 5, 8, 9, 11)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-clock text-accent text-xs"></i>
                        <span>Lun-Ven · 9h–18h</span>
                      </div>
                    </div>
                  </div>
                  <a
                    href="https://www.openstreetmap.org/?mlat=48.8600&amp;mlon=2.3770#map=16/48.8600/2.3770"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-gray-200 hover:border-secondary hover:bg-secondary hover:text-white rounded-xl text-sm font-bold text-primary transition-all"
                  >
                    <i className="fa-solid fa-diamond-turn-right"></i>
                    Itinéraire
                  </a>
                  <Link href="/contact#form" className="flex items-center justify-center gap-2 w-full py-3 bg-accent hover:bg-accent/90 rounded-xl text-sm font-bold text-white transition-all shadow-lg">
                    <i className="fa-solid fa-calendar-plus"></i>
                    Prendre rendez-vous
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
