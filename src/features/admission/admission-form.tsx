"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { DocumentUploadField } from "@/components/admin/document-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitApplication } from "@/actions/application.actions";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  lastName: z.string().min(2),
  firstName: z.string().min(2),
  cin: z.string().min(5),
  birthDate: z.string(),
  gender: z.enum(["M", "F", "Autre"]),
  address: z.string().min(5),
  city: z.string().min(2),
  phone: z.string().min(9),
  email: z.string().email(),
  educationLevel: z.string().min(2),
  formationId: z.string().min(1),
  cinFileUrl: z.string().url(),
  diplomaFileUrl: z.string().url(),
  photoFileUrl: z.string().url(),
});

type FormData = z.infer<typeof formSchema>;

interface AdmissionFormProps {
  dict: Dictionary;
  formations: { id: string; title: string }[];
}

export function AdmissionForm({ dict, formations }: AdmissionFormProps) {
  const f = dict.admission.fields;
  const [refs, setRefs] = useState({ cin: "", diploma: "", photo: "" });
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { gender: "M" },
  });

  const onSubmit = async (data: FormData) => {
    if (!refs.cin || !refs.diploma || !refs.photo) {
      toast.error(dict.admission.errors.documents);
      return;
    }

    const result = await submitApplication({
      ...data,
      birthDate: new Date(data.birthDate),
      cinFileUrl: refs.cin,
      diplomaFileUrl: refs.diploma,
      photoFileUrl: refs.photo,
    });

    if (result.success && result.data) {
      setSubmittedRef(result.data.referenceNumber);
      toast.success(dict.admission.success);
    } else {
      toast.error(result.error ?? dict.common.error);
    }
  };

  const handleNewApplication = () => {
    setSubmittedRef(null);
    setRefs({ cin: "", diploma: "", photo: "" });
    reset();
  };

  if (submittedRef) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
        <h3 className="mt-4 text-xl font-bold text-navy-900">{dict.admission.success}</h3>
        <p className="mt-2 text-sm text-navy-600">{dict.admission.successHint}</p>
        <p className="mt-6 text-xs font-medium uppercase tracking-wide text-navy-500">
          {dict.admission.reference}
        </p>
        <p className="mt-1 font-mono text-lg font-bold text-ocean-700">{submittedRef}</p>
        <Button variant="ocean" className="mt-8" onClick={handleNewApplication}>
          {dict.admission.newApplication}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <fieldset className="space-y-6">
        <legend className="sr-only">{dict.admission.title}</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={f.lastName} error={errors.lastName} errorMsg={dict.admission.errors.required}>
            <Input {...register("lastName")} />
          </Field>
          <Field label={f.firstName} error={errors.firstName} errorMsg={dict.admission.errors.required}>
            <Input {...register("firstName")} />
          </Field>
          <Field label={f.cin} error={errors.cin} errorMsg={dict.admission.errors.required}>
            <Input {...register("cin")} />
          </Field>
          <Field label={f.birthDate} error={errors.birthDate} errorMsg={dict.admission.errors.required}>
            <Input type="date" {...register("birthDate")} />
          </Field>
          <Field label={f.gender}>
            <select
              className="flex h-11 w-full rounded-lg border border-navy-200 bg-white px-4 text-sm"
              {...register("gender")}
            >
              <option value="M">{f.genderM}</option>
              <option value="F">{f.genderF}</option>
              <option value="Autre">{f.genderOther}</option>
            </select>
          </Field>
          <Field label={f.formation} error={errors.formationId} errorMsg={dict.admission.errors.formation}>
            <select
              className="flex h-11 w-full rounded-lg border border-navy-200 bg-white px-4 text-sm"
              {...register("formationId")}
            >
              <option value="">{f.formationPlaceholder}</option>
              {formations.map((formation) => (
                <option key={formation.id} value={formation.id}>
                  {formation.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label={f.address} error={errors.address} errorMsg={dict.admission.errors.required} className="sm:col-span-2">
            <Input {...register("address")} />
          </Field>
          <Field label={f.city} error={errors.city} errorMsg={dict.admission.errors.required}>
            <Input {...register("city")} />
          </Field>
          <Field label={f.phone} error={errors.phone} errorMsg={dict.admission.errors.required}>
            <Input {...register("phone")} />
          </Field>
          <Field label={f.email} error={errors.email} errorMsg={dict.admission.errors.required}>
            <Input type="email" {...register("email")} />
          </Field>
          <Field label={f.educationLevel} error={errors.educationLevel} errorMsg={dict.admission.errors.required}>
            <Input {...register("educationLevel")} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold uppercase tracking-wide text-ocean-600">
          {f.documents}
        </legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <DocumentUploadField
            label={f.cinDoc}
            hint={f.cinDocHint}
            endpoint="applicationDocument"
            uploaded={!!refs.cin}
            required
            onUploaded={(url) => {
              setRefs((r) => ({ ...r, cin: url }));
              setValue("cinFileUrl", url);
            }}
          />
          <DocumentUploadField
            label={f.diplomaDoc}
            hint={f.diplomaDocHint}
            endpoint="applicationDocument"
            uploaded={!!refs.diploma}
            required
            onUploaded={(url) => {
              setRefs((r) => ({ ...r, diploma: url }));
              setValue("diplomaFileUrl", url);
            }}
          />
          <DocumentUploadField
            label={f.photoDoc}
            hint={f.photoDocHint}
            endpoint="applicationPhoto"
            uploaded={!!refs.photo}
            required
            onUploaded={(url) => {
              setRefs((r) => ({ ...r, photo: url }));
              setValue("photoFileUrl", url);
            }}
          />
        </div>
      </fieldset>

      <Button type="submit" variant="ocean" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? dict.common.loading : dict.admission.submit}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  errorMsg,
  children,
  className,
}: {
  label: string;
  error?: { message?: string };
  errorMsg?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      {children}
      {error && errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
    </div>
  );
}
