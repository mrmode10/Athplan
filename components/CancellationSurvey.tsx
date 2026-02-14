import React, { useState } from 'react';
import Button from './Button';
import { supabase } from '../lib/supabase';
import { XIcon } from './icons/Icons';

interface CancellationSurveyProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CancellationSurvey: React.FC<CancellationSurveyProps> = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [answers, setAnswers] = useState({
        primary_reason: '',
        primary_reason_other: '',
        usage_frequency: '',
        usage_frequency_other: '',
        goals_met: '',
        goals_met_other: '',
        improvement_suggestion: '',
        improvement_suggestion_other: ''
    });

    if (!isOpen) return null;

    const handleOptionSelect = (question: keyof typeof answers, value: string) => {
        setAnswers(prev => ({ ...prev, [question]: value }));
    };

    const handleOtherChange = (question: keyof typeof answers, value: string) => {
        setAnswers(prev => ({ ...prev, [question]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            // 1. Save Survey
            const { error: surveyError } = await supabase.from('churn_surveys').insert({
                user_id: user.id,
                primary_reason: answers.primary_reason,
                primary_reason_other: answers.primary_reason === 'Other' ? answers.primary_reason_other : null,
                usage_frequency: answers.usage_frequency,
                usage_frequency_other: answers.usage_frequency === 'Other' ? answers.usage_frequency_other : null,
                goals_met: answers.goals_met,
                goals_met_other: answers.goals_met === 'Other' ? answers.goals_met_other : null,
                improvement_suggestion: answers.improvement_suggestion,
                improvement_suggestion_other: answers.improvement_suggestion === 'Other' ? answers.improvement_suggestion_other : null,
            });

            if (surveyError) throw surveyError;

            // 2. Cancel Subscription
            const { error: cancelError } = await supabase.functions.invoke('manage-subscription', {
                body: { action: 'cancel_subscription' }
            });

            if (cancelError) throw cancelError;

            onSuccess();
        } catch (error: any) {
            alert(`Error: ${error.message}`);
            setIsSubmitting(false);
        }
    };

    const QuestionBlock = ({
        title,
        questionKey,
        otherKey,
        options
    }: {
        title: string;
        questionKey: keyof typeof answers;
        otherKey: keyof typeof answers;
        options: string[]
    }) => (
        <div className="mb-6 animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
            <div className="space-y-3">
                {options.map(option => (
                    <label key={option} className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-colors">
                        <input
                            type="radio"
                            name={questionKey}
                            value={option}
                            checked={answers[questionKey] === option}
                            onChange={() => handleOptionSelect(questionKey, option)}
                            className="w-4 h-4 text-indigo-500 focus:ring-indigo-500 bg-slate-900 border-slate-600"
                        />
                        <span className="text-slate-300">{option}</span>
                    </label>
                ))}

                <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-colors">
                    <input
                        type="radio"
                        name={questionKey}
                        value="Other"
                        checked={answers[questionKey] === 'Other'}
                        onChange={() => handleOptionSelect(questionKey, 'Other')}
                        className="w-4 h-4 text-indigo-500 focus:ring-indigo-500 bg-slate-900 border-slate-600 mt-1"
                    />
                    <div className="flex-1">
                        <span className="text-slate-300 block mb-2">Other</span>
                        {answers[questionKey] === 'Other' && (
                            <input
                                type="text"
                                value={answers[otherKey]}
                                onChange={(e) => handleOtherChange(otherKey, e.target.value)}
                                placeholder="Please specify..."
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                            />
                        )}
                    </div>
                </label>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                    <XIcon className="w-6 h-6" />
                </button>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">We're sorry to see you go</h2>
                    <p className="text-slate-400">Please help us improve by answering a few quick questions.</p>
                </div>

                {step === 1 && (
                    <>
                        <QuestionBlock
                            title="1. What is the primary reason for ending your subscription today?"
                            questionKey="primary_reason"
                            otherKey="primary_reason_other"
                            options={[
                                "The price is too high for my current budget.",
                                "I am not seeing enough value for the price.",
                                "I found a more affordable alternative elsewhere."
                            ]}
                        />
                        <div className="flex justify-end pt-4">
                            <Button onClick={() => setStep(2)} disabled={!answers.primary_reason}>Next</Button>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <QuestionBlock
                            title="2. How often were you able to utilize the Athplan features?"
                            questionKey="usage_frequency"
                            otherKey="usage_frequency_other"
                            options={[
                                "I didn't save enough time.",
                                "My work has changed."
                            ]}
                        />
                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                            <Button onClick={() => setStep(3)} disabled={!answers.usage_frequency}>Next</Button>
                        </div>
                    </>
                )}

                {step === 3 && (
                    <>
                        <QuestionBlock
                            title="3. How well did the Athplan program meet your managing goals?"
                            questionKey="goals_met"
                            otherKey="goals_met_other"
                            options={[
                                "I achieved my initial goals and no longer need the service.",
                                "The program didn't provide the specific results.",
                                "I prefer to work and spend time answering questions."
                            ]}
                        />
                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                            <Button onClick={() => setStep(4)} disabled={!answers.goals_met}>Next</Button>
                        </div>
                    </>
                )}

                {step === 4 && (
                    <>
                        <QuestionBlock
                            title="4. What could we have done differently to keep you as a member?"
                            questionKey="improvement_suggestion"
                            otherKey="improvement_suggestion_other"
                            options={[
                                "Improved communication/support from the coaches.",
                                "Better organization of the group schedules/updates.",
                                "More exclusive content for my subscription tier."
                            ]}
                        />
                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={!answers.improvement_suggestion || isSubmitting}
                                className="bg-red-600 hover:bg-red-700 text-white border-red-500"
                            >
                                {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CancellationSurvey;
