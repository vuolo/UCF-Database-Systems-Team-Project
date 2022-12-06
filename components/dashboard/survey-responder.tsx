"use client";

import * as React from "react";
import { Survey, SurveyQuestion, SurveyResponse, User } from "@prisma/client";
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
  incomingResponses: SurveyResponse[];
  user: Pick<User, "id">;
}

type FormData = z.infer<typeof surveyPatchSchema>;

export function SurveyResponder({
  survey,
  incomingQuestions,
  incomingResponses,
  user,
}: EditorProps) {
  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(surveyPatchSchema),
  });
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

  const [responses, setResponses] =
    React.useState<SurveyResponse[]>(incomingResponses);

  function setResponseAnswer(answer: string | number, questionIndex: number) {
    if (typeof answer == "number")
      answer = answer > 5 ? 5 : answer < 1 ? 1 : answer;

    setResponses((prev) =>
      prev.map((r, rIndex) =>
        rIndex == questionIndex
          ? r.type == 1
            ? {
                ...r,
                type_1_answer: answer as number,
              }
            : {
                ...r,
                type_2_answer: answer as string,
              }
          : r
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

    // Check if each type 2 response has less than or equal to 200 words
    const type2Responses = responses.filter((r) => r.type == 2);
    const type2ResponsesWithTooManyWords = type2Responses.filter(
      (r) => r.type_2_answer!.split(" ").length > 200
    );

    if (type2ResponsesWithTooManyWords.length > 0) {
      setIsSaving(false);
      return toast({
        title: "Too many words (>200) in at least one of your responses.",
        message: "Your survey responses were not submitted. Please try again.",
        type: "error",
      });
    }

    const response = await fetch(`/api/submit-survey/${survey.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: user,
        questions: questions,
        responses: responses,
      }),
    });

    // Update Survey Response IDs
    try {
      let jsonResponse = await response.json();
      if (
        typeof jsonResponse.responses != "undefined" &&
        jsonResponse.responses.length == responses.length
      )
        setResponses((prev) =>
          prev.map((r, rIndex) =>
            r.id == "undefined"
              ? {
                  ...r,
                  id: jsonResponse.responses[rIndex].id,
                }
              : r
          )
        );
    } catch (error) {
      console.log(error);
    }

    setIsSaving(false);

    if (!response?.ok) {
      return toast({
        title: "Something went wrong.",
        message: "Your survey responses were not submitted. Please try again.",
        type: "error",
      });
    }

    router.refresh();

    return toast({
      message: "Your survey responses have been submitted!",
      type: "success",
    });
  }

  if (!isMounted) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='mt-6'>
      <div className='grid w-full gap-10'>
        <div className='prose prose-stone mx-auto w-[800px]'>
          <TextareaAutosize
            disabled
            contentEditable={false}
            // name='title'
            id='title'
            value={survey.title}
            placeholder='Survey title'
            className='w-full resize-none appearance-none overflow-hidden text-5xl font-bold focus:outline-none'
          />
          <TextareaAutosize
            disabled
            contentEditable={false}
            // name='description'
            id='description'
            value={survey.description}
            placeholder='Description'
            className='w-full resize-none appearance-none overflow-hidden text-xl focus:outline-none'
          />

          <div className='flex space-x-16'>
            <div className='flex flex-col'>
              <h3>Start Date</h3>
              <p>
                {startAt.toLocaleDateString("en-us", {
                  weekday: "long",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </p>
            </div>

            <div className='flex flex-col'>
              <h3>End Date</h3>
              <p>
                {endAt.toLocaleDateString("en-us", {
                  weekday: "long",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </p>
            </div>
          </div>

          <h2 className='mt-4'>Questions</h2>

          <div className='flex flex-col space-y-1'>
            {questions.length
              ? questions.map((question, qIndex) => (
                  <div key={question.id + qIndex}>
                    <h4 className='mt-2 flex space-x-2'>
                      {qIndex + 1}. {question.prompt}
                    </h4>

                    {question.type == 1 ? (
                      <input
                        type='number'
                        min='1'
                        max='5'
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                        onChange={(e) =>
                          setResponseAnswer(
                            e.target.value ? parseInt(e.target.value) : 1,
                            qIndex
                          )
                        }
                        value={
                          responses[qIndex]
                            ? (responses[qIndex].type_1_answer as number)
                            : 1
                        }
                        name={question.id + qIndex}
                        defaultValue={1}
                        placeholder='Type your answer, 1-5 here...'
                        className='mt-2 w-10 resize-none appearance-none overflow-hidden text-xl focus:outline-none'
                      />
                    ) : (
                      <TextareaAutosize
                        onChange={(e) =>
                          setResponseAnswer(e.target.value, qIndex)
                        }
                        value={
                          responses[qIndex]
                            ? (responses[qIndex].type_2_answer as string)
                            : ""
                        }
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

            <div className='flex items-center justify-center pb-6'>
              {responses.length && responses.length > 0 ? (
                <button
                  type='submit'
                  className='relative inline-flex h-9 items-center rounded-md border border-transparent bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2'
                >
                  {isSaving && (
                    <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  <span>
                    {isSaving ? "Submitting Responses..." : "Submit Responses"}
                  </span>
                </button>
              ) : (
                <p>There are no questions...</p>
              )}
            </div>
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
