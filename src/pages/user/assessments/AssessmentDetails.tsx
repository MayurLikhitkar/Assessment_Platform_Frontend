import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { ContentBox, Page, PageBody } from '../../../components/ui/Page';
import Button from '../../../components/ui/Button';
import { getAssessment } from '../../../services/axios/userApi';
import toast from 'react-hot-toast';
import DataLoader from '../../../components/common/DataLoader';
import { RiTimeLine, RiAwardLine, } from "react-icons/ri";
import { MdLibraryAddCheck, MdOutlineCalendarToday, MdOutlineCancel, MdQuiz, MdRefresh } from 'react-icons/md';
import { FaMicrophone, FaLock, FaRegSquareCheck, } from "react-icons/fa6";
import { IoShareSocial, IoVideocam, IoWifi } from "react-icons/io5";
import { TbAlertTriangleFilled, TbBrowserX } from "react-icons/tb";
import moment from 'moment';
import BackButton from '../../../components/common/BackButton';
import { BsRecordCircle, BsShieldCheck } from 'react-icons/bs';
import Confirmation from '../../../components/modal/Confirmation';

const AssessmentDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [start, setStart] = useState(false);

    useEffect(() => {
        if (!id) {
            toast.error('Assessment ID is required');
            navigate(-1);
        }
    }, [id, navigate]);

    const { data: assessmentData, isLoading } = useQuery({
        queryKey: ['assessment', id],
        queryFn: () => getAssessment(id as string),
        enabled: !!id,
    });

    const assessment = assessmentData?.data;

    const proctoringFeatures = [
        { icon: IoVideocam, active: assessment?.webcam.allowed, label: 'Webcam' },
        { icon: FaMicrophone, active: assessment?.microphone.allowed, label: 'Mic' },
        { icon: TbBrowserX, active: !assessment?.tabSwitch.allowed, label: 'Tab Lock' },
        { icon: FaLock, active: !assessment?.fullscreenExit.allowed, label: 'Fullscreen' },
    ];

    const stats = [
        { icon: RiTimeLine, label: "Duration", value: `${assessment?.durationInMinutes} mins` },
        { icon: RiAwardLine, label: "Total Marks", value: `${assessment?.totalMarks} marks` },
        { icon: MdQuiz, label: "Questions", value: assessment?.questions?.length },
    ]

    const hasProctoring = assessment?.webcam.allowed || assessment?.microphone.allowed || assessment?.tabSwitch.allowed || assessment?.fullscreenExit.allowed || assessment?.enableRecording;

    const handleStartConfirm = () => {
        setStart(false);
        document.documentElement.requestFullscreen().catch(() => {
            // Fullscreen request failed (e.g. browser blocked it), proceed anyway
        }).finally(() => {
            navigate(`/assessments/${assessment?._id}/lobby`);
        });
    };


    return (
        <Page>
            <PageBody>
                <div className='flex items-center justify-between w-full'>
                    <BackButton variant='glass' size='md' ><span className='font-semibold'>Back</span></BackButton>
                    <Button variant='icon' className='bg-background-main border border-border-light shadow-sm hover:shadow-sm text-text-main hover:text-primary-main rounded-lg' size='md'><IoShareSocial className='w-5 h-5' /></Button>
                </div>
                {isLoading ? (
                    <DataLoader />
                ) : assessment ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Details */}
                        <div className="lg:col-span-2 space-y-6">
                            <ContentBox className='space-y-5'>
                                {/* Meta Badges */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {assessment.type.map((t) => (
                                        <span key={t} className="px-3 py-1 rounded-md bg-muted-light text-text-light font-bold uppercase text-xs border border-border-light">
                                            {t}
                                        </span>
                                    ))}
                                </div>

                                <h1 className="text-3xl sm:text-4xl font-semibold">
                                    {assessment.title}
                                </h1>

                                <p className="text-base">
                                    {assessment.description}
                                </p>

                                {/* Quick Stats Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {stats.map((stat) => (
                                        <div key={stat.label} className="p-4 bg-background-main rounded-xl border border-border-light">
                                            <div className="flex items-center gap-2 text-text-light mb-2">
                                                <stat.icon className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase">{stat.label}</span>
                                            </div>
                                            <p className="text-lg font-bold text-text-main">{stat.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Schedule Section */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { label: 'Start Date', value: moment(assessment.startDate).format('DD MMM YYYY') },
                                        { label: 'End Date', value: moment(assessment.endDate).format('DD MMM YYYY') },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex items-center gap-3 p-4 bg-background-main rounded-xl border border-border-light">
                                            <div className="p-2 rounded-lg bg-background-light flex items-center justify-center shadow-sm border border-border-light">
                                                <MdOutlineCalendarToday className="w-5 h-5 text-dark-light" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-dark-light uppercase tracking-wide">{label}</p>
                                                <p className="text-sm font-bold text-text-main">{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ContentBox>

                            {/* Instructions Card */}
                            <ContentBox>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 flex items-center justify-center rounded-lg bg-primary-light/15 text-primary-main">
                                        <TbAlertTriangleFilled className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-text-main">General Instructions</h3>
                                </div>
                                <div className="text-text-main whitespace-pre-wrap space-y-6 mt-3">
                                    {/* 1. General Rules */}
                                    <div className="space-y-3">
                                        <h4 className="text-base font-bold text-text-main flex items-center gap-2">
                                            General Guidelines
                                        </h4>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-text-light">
                                            {[
                                                { color: 'text-secondary-main', icon: IoWifi, label: 'Wifi', value: 'Ensure a stable internet connection before starting.' },
                                                { color: 'text-warn-main', icon: RiTimeLine, label: 'Duration', value: 'The timer cannot be paused once the assessment begins.' },
                                                { color: 'text-error-main', icon: MdRefresh, label: 'Refresh', value: 'Do not refresh or close the browser window.' },
                                                { color: 'text-success-main', icon: MdLibraryAddCheck, label: 'Answers', value: 'Submit your answers before the time expires.' },
                                            ].map(rule => (
                                                <div key={rule.label} className="flex items-center gap-3 p-3 rounded-lg border border-border-light">
                                                    <rule.icon className={`w-5 h-5 shrink-0 ${rule.color}`} />
                                                    <span>{rule.value}</span>
                                                </div>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* 2. Proctoring Rules (Only if any proctoring feature is enabled) */}
                                    {hasProctoring && (
                                        <div className="space-y-3">
                                            <h4 className="text-base font-bold text-text-main flex items-center gap-2">
                                                Proctoring & Security
                                            </h4>
                                            <ul className="space-y-2 text-sm text-text-light">
                                                {[
                                                    { condition: assessment.webcam.allowed, color: 'text-dark-light', icon: IoVideocam, label: 'Webcam', value: 'Webcam access is required and must remain unobstructed.', },
                                                    { condition: assessment.microphone.allowed, color: 'text-dark-light', icon: FaMicrophone, label: 'Microphone', value: 'Microphone must be enabled in a quiet environment.', },
                                                    { condition: assessment.tabSwitch.allowed, color: 'text-dark-light', icon: TbBrowserX, label: 'Tab Switch', value: 'Switching browser tabs or applications is strictly prohibited.', },
                                                    { condition: assessment.fullscreenExit.allowed, color: 'text-dark-light', icon: FaLock, label: 'Fullscreen', value: 'Exiting fullscreen mode will trigger a warning.', },
                                                    { condition: assessment.enableRecording, color: 'text-error-main', icon: BsRecordCircle, label: 'Recording', value: 'Your screen and video session will be recorded for monitoring.', className: 'animate-pulse', },
                                                ]
                                                    .filter(rule => rule.condition)
                                                    .map(rule => (
                                                        <div key={rule.label} className="flex items-center gap-3">
                                                            <rule.icon className={`w-5 h-5 shrink-0 ${rule.color} ${rule.className ?? ''}`} />
                                                            <span>{rule.value}</span>
                                                        </div>
                                                    ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* 3. Academic Integrity */}
                                    <div className="p-4 rounded-xl bg-accent-light/5 text-text-main border border-accent-light/20 flex gap-3 items-center">
                                        <BsShieldCheck className="w-7 h-7 text-accent-main shrink-0" />
                                        <div>
                                            <h4 className="font-bold">Academic Integrity</h4>
                                            <p className="text-sm mt-1">
                                                By starting this assessment, you agree to follow all rules. Any violation or use of unfair means may result in immediate termination and disqualification.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </ContentBox>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                {assessment.tags.map((tag) => (
                                    <span key={tag} className="px-2 py-1 rounded-md bg-background-inverse text-text-inverse text-sm font-semibold hover:bg-primary-main transition-colors">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Settings & Sidebar */}
                        <div className="space-y-5">
                            <ContentBox className=" text-text-main space-y-3">
                                <h3 className="text-xl font-semibold">Ready to Go?</h3>
                                <p className="">Ensure your camera and microphone are working before starting the session.</p>

                                <Button variant='custom' className='w-full bg-secondary-main text-text-inverse rounded-lg tracking-wider' size='md' onClick={() => setStart(true)}>
                                    START ASSESSMENT
                                </Button>
                            </ContentBox>

                            {/* Proctoring Status */}
                            <ContentBox>
                                <h3 className="text-lg font-bold mb-3">Proctoring</h3>

                                <div className="space-y-2">
                                    {proctoringFeatures.map((feat) => (
                                        <div
                                            key={feat.label}
                                            className={`flex bg-background-main border-muted-main items-center gap-3 p-4 rounded-xl border ${feat.active
                                                ? "text-text-main"
                                                : " text-text-light/60"
                                                }`}
                                        >
                                            <feat.icon className="w-5 h-5 shrink-0" />
                                            <p className="flex-1 text-sm font-semibold">{feat.label}</p>
                                            {feat.active ? (
                                                <FaRegSquareCheck className="w-5 h-5 shrink-0 text-success-main" />
                                            ) : (
                                                <MdOutlineCancel className="w-5 h-5 shrink-0 text-error-main" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </ContentBox>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center py-10 text-error-main">Assessment not found</div>
                )}
            </PageBody>
            <Confirmation
                maxWidth='2xl'
                title='Assessment Warning'
                isOpen={start}
                onClose={() => setStart(false)}
                onConfirm={handleStartConfirm}
            >
                <div className="space-y-4 text-left">
                    <p className="text-text-main font-medium">
                        You are about to start the assessment. Please confirm you understand
                        the following:
                    </p>
                    <ul className="space-y-2 text-sm text-text-main list-disc pl-4">
                        <li>
                            The timer will begin immediately and <strong>cannot be paused</strong>.
                        </li>
                        <li>
                            Do not refresh, close, or navigate away from this page.
                        </li>
                        {hasProctoring && (
                            <>
                                <li>
                                    Proctoring is <strong>enabled</strong>. Your webcam, microphone, and screen may be monitored.
                                </li>
                                <li>
                                    Switching tabs or exiting fullscreen will trigger warnings and may result in termination.
                                </li>
                            </>
                        )}
                        <li>
                            Ensure a stable internet connection before proceeding.
                        </li>
                    </ul>
                    <div className="border border-warn-light/50 bg-warn-light/15 rounded-md p-3 text-sm">
                        By clicking "Start Assessment", you agree to abide by all rules and
                        acknowledge that any violation may result in disqualification.
                    </div>
                </div>
            </Confirmation>

        </Page>
    )
}

export default AssessmentDetails;