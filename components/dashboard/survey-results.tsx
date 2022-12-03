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
  incomingResponses: (SurveyResponse & { respondentEmail: string })[];
  user: Pick<User, "id">;
}

type FormData = z.infer<typeof surveyPatchSchema>;

export function SurveyResults({
  survey,
  incomingQuestions,
  incomingResponses,
  user,
}: EditorProps) {
  const [questions, setQuestions] =
    React.useState<SurveyQuestion[]>(incomingQuestions);

  const [responses, setResponses] =
    React.useState<(SurveyResponse & { respondentEmail: string })[]>(
      incomingResponses
    );

  function calcMean(questionId: string) {
    let total = 0;
    let count = 0;
    for (let i = 0; i < responses.length; i++) {
      if (responses[i].type == 1 && responses[i].questionId == questionId) {
        total += responses[i].type_1_answer!;
        count += 1;
      }
    }

    return count == 0 ? "Unavailable" : total / count;
  }

  function calcVariance(questionId: string) {
    let nums: number[] = [];

    for (let i = 0; i < responses.length; i++) {
      if (responses[i].type == 1 && responses[i].questionId == questionId) {
        nums.push(responses[i].type_1_answer!);
      }
    }

    return nums.length == 0 ? "Unavailable" : findVariance(nums);
  }

  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [isMounted, setIsMounted] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <section className='container grid items-center justify-center gap-6 pt-6 pb-8 md:pt-10 md:pb-12 lg:pt-16 lg:pb-24'>
      <div className='mx-auto flex flex-col items-start gap-4 lg:w-[52rem]'>
        <h1 className='text-3xl font-bold leading-[1.1] tracking-tighter sm:text-5xl md:text-6xl'>
          Results for <u>{survey.title}</u>
        </h1>
        <p className='max-w-[42rem] leading-normal text-slate-700 sm:text-xl sm:leading-8'>
          {survey.description}
        </p>
        <div className='flex flex-col space-y-1'>
          {questions.length
            ? questions.map((question, qIndex) => (
                <div key={question.id + qIndex}>
                  <h4 className='mt-2 flex space-x-2 font-bold'>
                    {qIndex + 1}.{" "}
                    <p className='ml-2 w-full resize-none appearance-none overflow-hidden text-l focus:outline-none'>
                      {question.prompt}
                    </p>
                  </h4>
                  <p>
                    <u>Type:</u> {question.type}
                  </p>
                  {question.type == 1 ? (
                    <>
                      <p>
                        <u>Mean:</u> {calcMean(question.id)}
                      </p>
                      <p>
                        <u>Variance:</u> {calcVariance(question.id)}
                      </p>
                      <p>
                        <u>Answers:</u>
                        {responses.map((response, responseIndex) =>
                          response.questionId == question.id &&
                          response.type_1_answer ? (
                            <li key={response.id}>
                              {response.respondentEmail}:{" "}
                              {response.type_1_answer}
                            </li>
                          ) : null
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        <u>Answers:</u>
                        {responses.map((response, responseIndex) =>
                          response.questionId == question.id ? (
                            <li key={response.id}>
                              {response.respondentEmail}:{" "}
                              {response.type_2_answer}
                            </li>
                          ) : null
                        )}
                      </p>
                    </>
                  )}
                </div>
              ))
            : null}
        </div>
      </div>
    </section>
  );
}

const findVariance = (arr: number[] = []) => {
  if (!arr.length) {
    return 0;
  }
  const sum = arr.reduce((acc, val) => acc + val);
  const { length: num } = arr;
  const median = sum / num;
  let variance = 0;
  arr.forEach((num) => {
    variance += (num - median) * (num - median);
  });
  variance /= num;
  return variance;
};
