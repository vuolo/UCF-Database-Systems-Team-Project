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
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

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
    <section
      id='results'
      className='container grid items-center justify-center gap-6 pt-6 pb-8 md:pt-10 md:pb-12 lg:pt-16 lg:pb-24'
    >
      <div className='mx-auto flex flex-col items-start gap-4 lg:w-[52rem]'>
        <h1 className='text-3xl font-bold leading-[1.1] tracking-tighter sm:text-5xl md:text-6xl'>
          Results for <u>{survey.title}</u>
        </h1>
        <p className='max-w-[42rem] leading-normal text-slate-700 sm:text-xl sm:leading-8'>
          {survey.description}
        </p>
        <div className='flex space-x-16'>
          <div className='flex flex-col'>
            <h3 className='font-bold'>Start Date</h3>
            <p>
              {new Date(survey.startAt).toLocaleDateString("en-us", {
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
            <h3 className='font-bold'>End Date</h3>
            <p>
              {new Date(survey.endAt).toLocaleDateString("en-us", {
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
        <h2 className='mt-4 font-bold text-2xl'>Questions:</h2>
        <div className='flex flex-col space-y-1'>
          {questions.length ? (
            questions.map((question, qIndex) => (
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
                            {/* {response.respondentEmail}: {response.type_1_answer} */}
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
                            {/* {response.respondentEmail}: {response.type_2_answer} */}
                            {response.type_2_answer}
                          </li>
                        ) : null
                      )}
                    </p>
                  </>
                )}
              </div>
            ))
          ) : (
            <p>There are no questions...</p>
          )}

          <div className='flex pt-5 space-x-3'>
            <button
              onClick={print}
              className='relative inline-flex h-9 items-center rounded-md border border-transparent bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 print:hidden'
            >
              <Icons.print className='h-5 mr-3' />
              <span>Print Results</span>
            </button>
            <button
              onClick={savePDF}
              className='relative inline-flex h-9 items-center rounded-md border border-transparent bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 print:hidden'
            >
              <Icons.download className='h-5 mr-3' />
              <span>Save Results to Computer</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function savePDF() {
  html2canvas(document.body).then(function (canvas) {
    var img = canvas.toDataURL("image/png");
    var doc = new jsPDF();
    doc.addImage(
      img,
      "JPEG",
      0,
      0,
      Math.round(window.innerWidth / 8),
      Math.round(window.innerHeight / 8)
    );
    doc.save("survey-results.pdf");
  });
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
