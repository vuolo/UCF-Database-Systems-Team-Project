"use client";

import * as React from "react";
import { Survey } from "@prisma/client";
import { useForm } from "react-hook-form";
import Link from "next/link";
import TextareaAutosize from "react-textarea-autosize";
import Switch from "react-switch";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { surveyPatchSchema } from "@/lib/validations/survey";
import { toast } from "@/ui/toast";
import { Icons } from "@/components/icons";

interface EditorProps {
  survey: Pick<Survey, "id" | "title" | "description" | "published">;
}

type FormData = z.infer<typeof surveyPatchSchema>;

export function Editor({ survey }: EditorProps) {
  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(surveyPatchSchema),
  });
  const [isPublished, setIsPublished] = React.useState<boolean>(
    survey.published
  );

  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [isMounted, setIsMounted] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") setIsMounted(true);
  }, []);

  async function onSubmit(data: FormData) {
    setIsSaving(true);

    const response = await fetch(`/api/surveys/${survey.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        published: isPublished,
      }),
    });

    setIsSaving(false);

    if (!response?.ok) {
      return toast({
        title: "Something went wrong.",
        message: "Your survey was not saved. Please try again.",
        type: "error",
      });
    }

    router.refresh();

    return toast({
      message: "Your survey has been saved.",
      type: "success",
    });
  }

  if (!isMounted) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='grid w-full gap-10'>
        <div className='flex w-full items-center justify-between'>
          <div className='flex items-center space-x-10'>
            <Link
              href='/dashboard'
              className='inline-flex items-center rounded-lg border border-transparent bg-transparent py-2 pl-3 pr-5 text-sm font-medium text-slate-900 hover:border-slate-200 hover:bg-slate-100 focus:z-10 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white dark:focus:ring-slate-700'
            >
              <>
                <Icons.chevronLeft className='mr-2 h-4 w-4' />
                Back
              </>
            </Link>
            <div className='flex items-center space-x-2'>
              <Switch
                onChange={() => {
                  setIsPublished((prev) => !prev);
                }}
                checked={isPublished}
              />
              <p className='text-sm text-slate-600'>
                {isPublished ? "Published" : "Draft"}
              </p>
            </div>
          </div>
          <button
            type='submit'
            className='relative inline-flex h-9 items-center rounded-md border border-transparent bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2'
          >
            {isSaving && (
              <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
            )}
            <span>Save</span>
          </button>
        </div>
        <div className='prose prose-stone mx-auto w-[800px]'>
          <TextareaAutosize
            autoFocus
            // name='title'
            id='title'
            defaultValue={survey.title}
            placeholder='Survey title'
            className='w-full resize-none appearance-none overflow-hidden text-5xl font-bold focus:outline-none'
            {...register("title")}
          />
          <TextareaAutosize
            autoFocus
            // name='description'
            id='description'
            defaultValue={survey.description}
            placeholder='Description'
            className='w-full resize-none appearance-none overflow-hidden text-xl focus:outline-none'
            {...register("description")}
          />
        </div>
      </div>
    </form>
  );
}
