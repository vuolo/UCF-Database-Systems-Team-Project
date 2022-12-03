"use client";

import * as React from "react";
import { Survey, SurveyQuestion } from "@prisma/client";
import { useForm } from "react-hook-form";
import Link from "next/link";
import TextareaAutosize from "react-textarea-autosize";
import Switch from "react-switch";
import DateTimePicker from "react-datetime-picker";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { surveyPatchSchema } from "@/lib/validations/survey";
import { toast } from "@/ui/toast";
import { Icons } from "@/components/icons";
import { db } from "@/lib/db";

interface EditorProps {
  survey: Pick<
    Survey,
    "id" | "title" | "description" | "published" | "startAt" | "endAt"
  >;
  incomingQuestions: SurveyQuestion[];
}

type FormData = z.infer<typeof surveyPatchSchema>;

export function Editor({ survey, incomingQuestions }: EditorProps) {
  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(surveyPatchSchema),
  });
  const [isPublished, setIsPublished] = React.useState<boolean>(
    survey.published
  );
  const [startAt, setStartAt] = React.useState<Date>(
    typeof survey.startAt == "string"
      ? new Date(survey.startAt)
      : survey.startAt
  );
  const [endAt, setEndAt] = React.useState<Date>(
    typeof survey.endAt == "string" ? new Date(survey.endAt) : survey.endAt
  );
  const [questions, setQuestions] =
    React.useState<SurveyQuestion[]>(incomingQuestions);

  function addQuestion(type: number) {
    setQuestions((prev) => [
      ...prev,
      {
        id: "undefined",
        surveyId: survey.id,
        prompt: "",
        type: type,
      },
    ]);
  }

  function moveQuestion(questionIndex: number, direction: string) {
    if (direction == "down") {
      setQuestions((prev) =>
        array_move([...prev], questionIndex, questionIndex + 1)
      );
    } else if (direction == "up") {
      setQuestions((prev) =>
        array_move([...prev], questionIndex, questionIndex - 1)
      );
    }
  }

  function deleteQuestion(questionIndex: number) {
    setQuestions((prev) => prev.filter((q, qIndex) => qIndex != questionIndex));
  }

  function setQuestionPrompt(prompt: string, questionIndex: number) {
    setQuestions((prev) =>
      prev.map((q, qIndex) =>
        qIndex == questionIndex
          ? {
              ...q,
              prompt: prompt,
            }
          : q
      )
    );
  }

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
        startAt: startAt,
        endAt: endAt,
        questions: questions,
      }),
    });

    // Update Survey Question IDs
    let jsonResponse = await response.json();
    if (jsonResponse.questions)
      setQuestions((prev) =>
        prev.map((q, qIndex) =>
          q.id == "undefined"
            ? {
                ...q,
                id: jsonResponse.questions[qIndex].id,
              }
            : q
        )
      );

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
            <span>{isSaving ? "Saving..." : "Save"}</span>
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

          <div className='flex space-x-16'>
            <div className='flex flex-col'>
              <h3>Start Date</h3>
              <DateTimePicker
                onChange={setStartAt}
                value={startAt}
                clearIcon={null}
                className='w-100'
              />
            </div>

            <div className='flex flex-col'>
              <h3>End Date</h3>
              <DateTimePicker
                onChange={setEndAt}
                value={endAt}
                clearIcon={null}
                className='w-100'
              />
            </div>
          </div>

          <h2>Questions</h2>
          <div className='flex space-x-16'>
            <a
              onClick={() => addQuestion(1)}
              className='cursor-pointer no-underline relative inline-flex h-9 items-center rounded-md border border-transparent bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2'
            >
              <span>+ Add Type 1 (number 1-5)</span>
            </a>
            <a
              onClick={() => addQuestion(2)}
              className='cursor-pointer no-underline relative inline-flex h-9 items-center rounded-md border border-transparent bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2'
            >
              <span>+ Add Type 2 (text up to 200 words)</span>
            </a>
          </div>

          <div className='flex flex-col space-y-1'>
            {questions.length
              ? questions.map((question, qIndex) => (
                  <div key={question.id + qIndex}>
                    <div className='flex space-x-4 mt-8'>
                      {/* Down */}
                      <Icons.arrowRight
                        onClick={() => moveQuestion(qIndex, "down")}
                        className={`${
                          qIndex == questions.length - 1
                            ? "cursor-not-allowed opacity-25"
                            : "cursor-pointer"
                        } rotate-90`}
                      />
                      {/* Up */}
                      <Icons.arrowRight
                        onClick={() => moveQuestion(qIndex, "up")}
                        className={`${
                          qIndex == 0
                            ? "cursor-not-allowed opacity-25"
                            : "cursor-pointer"
                        } rotate-[-90deg]`}
                      />
                      <Icons.trash
                        onClick={() => deleteQuestion(qIndex)}
                        className='cursor-pointer'
                      />
                    </div>
                    <h4 className='mt-2 flex space-x-2'>
                      {qIndex + 1}.{" "}
                      <TextareaAutosize
                        autoFocus
                        onChange={(e) =>
                          setQuestionPrompt(e.target.value, qIndex)
                        }
                        value={question.prompt}
                        placeholder='Write your question prompt here...'
                        className='ml-2 w-full resize-none appearance-none overflow-hidden text-l focus:outline-none'
                      />
                    </h4>

                    {question.type == 1 ? (
                      <input
                        disabled
                        type='number'
                        min='1'
                        max='5'
                        name={question.id + qIndex}
                        defaultValue={1}
                        placeholder='Description'
                        className='mt-2 w-full resize-none appearance-none overflow-hidden text-xl focus:outline-none'
                      />
                    ) : (
                      <TextareaAutosize
                        disabled
                        placeholder='Write your answer here...'
                        className='mt-2 w-full resize-none appearance-none overflow-hidden text-xl focus:outline-none'
                      />
                    )}

                    <p>
                      <i>
                        {question.type == 1
                          ? "(answer with a number 1-5, with 1 being most negative and 5 most positive)"
                          : "(answer with text up to 200 words)"}
                      </i>
                    </p>
                  </div>
                ))
              : null}
          </div>
        </div>
      </div>
    </form>
  );
}

function array_move(arr: any[], old_index: number, new_index: number) {
  if (new_index >= arr.length) {
    var k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr;
}
