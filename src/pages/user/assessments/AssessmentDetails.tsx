import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { ContentBox, Page, PageBody } from '../../../components/ui/Page';
import Button from '../../../components/ui/Button';
import { getAssessment } from '../../../services/axios/userApi';
import toast from 'react-hot-toast';
import DataLoader from '../../../components/common/DataLoader';
import {
    RiTimeLine, RiAwardLine, RiGroupLine, RiCalendarLine, RiAlertLine,
} from "react-icons/ri";
import { MdOutlineCancel } from 'react-icons/md';
import { FaMicrophone, FaLock, FaRegSquareCheck, } from "react-icons/fa6";
import { IoShareSocial, IoVideocam } from "react-icons/io5";
import { TbBrowserX } from "react-icons/tb";
import moment from 'moment';
import BackButton from '../../../components/common/BackButton';

const AssessmentDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) {
            toast.error('Assessment ID is required');
            navigate(-1);
        }
    }, [id, navigate]);

    const { data: assessmentData, isLoading } = useQuery({
        queryKey: ['assessment', id],
        queryFn: () => getAssessment(id as string | number),
        enabled: !!id,
    });

    const assessment = assessmentData?.data;

    const proctoringFeatures = [
        { icon: IoVideocam, active: assessment?.requireWebcam, label: 'Webcam' },
        { icon: FaMicrophone, active: assessment?.requireMicrophone, label: 'Mic' },
        { icon: TbBrowserX, active: !assessment?.allowTabSwitch, label: 'Tab Lock' },
        { icon: FaLock, active: !assessment?.allowFullscreenExit, label: 'Fullscreen' },
    ];

    const stats = [
        { icon: RiTimeLine, label: "Duration", value: `${assessment?.durationInMinutes} mins`, color: "text-secondary-main", bg: "bg-secondary-light/10" },
        { icon: RiAwardLine, label: "Total Marks", value: `${assessment?.totalMarks} marks`, color: "text-primary-main", bg: "bg-primary-light/10" },
        { icon: RiGroupLine, label: "Questions", value: assessment?.questions.length, color: "text-accent-main", bg: "bg-accent-light/10" },
    ]

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
                                        <span key={t} className="px-3 py-1 rounded-md bg-muted-light text-text-light font-bold uppercase text-xs border border-muted-main">
                                            {t}
                                        </span>
                                    ))}
                                </div>

                                <h1 className="text-3xl sm:text-4xl font-semibold">
                                    {assessment.title}
                                </h1>

                                <p className="text-lg">
                                    {assessment.description}
                                </p>

                                {/* Quick Stats Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {stats.map((stat) => (
                                        <div key={stat.label} className="p-4 bg-background-main rounded-xl border border-border-light">
                                            <div className="flex items-center gap-2 text-dark-light mb-2">
                                                <stat.icon className="w-4 h-4" />
                                                <span className="text-[11px] font-bold uppercase tracking-wide">{stat.label}</span>
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
                                            <div className="w-10 h-10 rounded-lg bg-background-light flex items-center justify-center shadow-sm border border-border-light">
                                                <RiCalendarLine className="w-5 h-5 text-dark-light" />
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
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-light/10 text-primary-main">
                                        <RiAlertLine className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-text-dark">Candidate Instructions</h3>
                                </div>
                                <div className="prose prose-sm max-w-none text-text-main">
                                    <p className="leading-relaxed bg-background-main p-6 rounded-2xl border border-muted-light border-dashed">
                                        {assessment.instructions}
                                    </p>
                                </div>
                            </ContentBox>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                {assessment.tags.map((tag) => (
                                    <span key={tag} className="px-4 py-2 rounded-xl bg-background-inverse text-text-inverse text-xs font-bold hover:bg-primary-main transition-colors cursor-default">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Settings & Sidebar */}
                        <div className="space-y-5">
                            <ContentBox className="bg-dark-dark text-text-inverse space-y-3">
                                <h3 className="text-xl font-semibold">Ready to Go?</h3>
                                <p className="text-text-inverse/60">Ensure your camera and microphone are working before starting the session.</p>

                                <Button className='w-full' size='md'>
                                    START
                                </Button>
                            </ContentBox>

                            {/* Proctoring Status */}
                            <ContentBox>
                                <h3 className="text-lg font-bold mb-3">Security Settings</h3>

                                <div className="space-y-2">
                                    {proctoringFeatures.map((feat) => (
                                        <div
                                            key={feat.label}
                                            className={`flex items-center gap-3 p-4 rounded-xl border ${feat.active
                                                ? "bg-dark-dark text-text-inverse"
                                                : "bg-background-main border-muted-main text-text-light"
                                                }`}
                                        >
                                            <feat.icon className="w-5 h-5 shrink-0" />
                                            <p className="flex-1 text-sm font-semibold">{feat.label}</p>
                                            {feat.active ? (
                                                <FaRegSquareCheck className="w-5 h-5 shrink-0" />
                                            ) : (
                                                <MdOutlineCancel className="w-5 h-5 shrink-0" />
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
        </Page>
    )
}

export default AssessmentDetails;