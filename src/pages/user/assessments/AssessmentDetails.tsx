import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { ContentBox, Page, PageBody } from '../../../components/ui/Page';
import Button from '../../../components/ui/Button';
import { getAssessment } from '../../../services/axios/userApi';
import toast from 'react-hot-toast';
import DataLoader from '../../../components/common/DataLoader';
import {
    RiTimeLine, RiAwardLine, RiCheckboxCircleLine, RiGroupLine, RiCalendarLine, RiAlertLine, RiPlayFill, RiCloseCircleLine,
    RiHistoryLine,
} from "react-icons/ri";
import { MdEdit, MdOutlineSettings } from 'react-icons/md';
import { FaMicrophone, FaLock, } from "react-icons/fa6";
import { IoVideocam } from "react-icons/io5";
import { TbBrowserX } from "react-icons/tb";
import moment from 'moment';

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
                        <div className="space-y-8">
                            {/* Main CTA */}
                            <div
                                className="bg-background-inverse rounded-3xl p-8 text-text-inverse shadow-2xl shadow-black/20"
                            >
                                <h3 className="text-xl font-black mb-2">Ready to Go?</h3>
                                <p className="text-sm text-text-inverse/60 mb-8 leading-relaxed">Ensure your camera and microphone are working before starting the session.</p>

                                <div className="space-y-3">
                                    <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary-main text-text-inverse rounded-2xl font-black hover:bg-primary-dark transition-all shadow-lg shadow-primary-main/30 group">
                                        <RiPlayFill className="w-6 h-6" />
                                        START ASSESSMENT
                                    </button>
                                    <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/10 text-text-inverse rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/5">
                                        <MdEdit className="w-5 h-5" />
                                        EDIT DETAILS
                                    </button>
                                </div>
                            </div>

                            {/* Proctoring Status */}
                            <div className="bg-background-light rounded-3xl border border-muted-light p-6 shadow-sm overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4">
                                    <MdOutlineSettings className="w-5 h-5 text-muted-dark hover:text-text-dark transition-colors cursor-pointer" />
                                </div>
                                <h3 className="text-lg font-bold text-text-dark mb-6">Security Settings</h3>

                                <div className="space-y-4">
                                    {proctoringFeatures.map((feat) => (
                                        <div key={feat.label} className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl shrink-0 ${feat.active ? 'bg-background-inverse text-primary-main' : 'bg-background-main text-muted-dark border border-muted-light'}`}>
                                                <feat.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <p className={`text-sm font-bold ${feat.active ? 'text-text-dark' : 'text-text-light'}`}>{feat.label}</p>
                                                    {feat.active ? (
                                                        <RiCheckboxCircleLine className="w-4 h-4 text-success-main" />
                                                    ) : (
                                                        <RiCloseCircleLine className="w-4 h-4 text-muted-dark" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Author info */}
                            <div className="bg-background-main rounded-3xl p-6 border border-muted-light flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-background-inverse flex items-center justify-center text-primary-main font-black text-xl shadow-lg shadow-black/10">
                                    {assessment.createdBy.split(" ").map(n => n[0]).join("")}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-primary-main uppercase tracking-widest mb-0.5">Assessment Lead</p>
                                    <p className="text-base font-black text-text-dark">{assessment.createdBy}</p>
                                    <p className="text-xs text-text-light">Updated {moment(assessment.updatedAt).fromNow()}</p>
                                </div>
                            </div>
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