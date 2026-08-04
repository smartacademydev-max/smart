import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Box, Button, Typography, useTheme } from "@mui/material";
import { Calendar, Timer, UserEdit, UserTag } from "iconsax-reactjs";
import { useNavigate, useParams } from "react-router-dom";
import { PATH } from '../../../../../routes/PATH';
import { useGetQuestionsListInTestQuery } from "../../../../../services/questionApi";
import { formatDateTime } from '../../../../../utils/dateFormat';
import { renderHtml } from "../../../../../utils/renderHtml";
import QuestionIssueDot from "../../../../atoms/QuestionIssueDot";


const getAnswerStyle = (isCorrect: boolean, isWrong: boolean, theme: any) => ({
	border: `1.5px solid`,
	borderColor: isCorrect
		? theme.palette.success.main
		: isWrong
			? theme.palette.error.main
			: theme.palette.separator.dark,
	bgcolor: isCorrect
		? theme.palette.success.light
		: isWrong
			? theme.palette.error.light
			: "transparent",
});

const OptionIcon = ({ isCorrect, isWrong }: { isCorrect: boolean; isWrong: boolean }) => {
	if (isCorrect) {
		return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />;
	}
	if (isWrong) {
		return <CancelIcon sx={{ color: 'error.main', fontSize: 20 }} />;
	}
	return (
		<Box
			sx={{
				width: 20,
				height: 20,
				borderRadius: '50%',
				border: `1.5px solid`,
				borderColor: (theme) => theme.palette.separator.dark,
			}}
		/>
	);
};

const AnswerStatusBadge = ({ type }: { type?: string }) => {
	const isCorrect = type === "correct";
	const isIncorrect = type === "incorrect" || type === "skipped";

	return (
		<Typography
			variant='subtitle1'
			className='capitalize max-w-fit py-1.5! px-3! rounded-lg mt-5! flex items-center gap-2'
			sx={(theme) => ({
				...getAnswerStyle(isCorrect, isIncorrect, theme),
				color: isCorrect
					? theme.palette.success.main
					: isIncorrect
						? theme.palette.error.main
						: theme.palette.text.primary,
			})}
		>
			{isCorrect && <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />}
			{isIncorrect && <CancelIcon sx={{ color: 'error.main', fontSize: 20 }} />}
			{type} Answer
		</Typography>
	);
};

const DetailItem = ({
	icon: Icon,
	label,
	value,
	colSpan = 1,
	bgColor
}: {
	icon: React.ReactElement;
	label: string;
	value: string | null | undefined;
	colSpan?: number;
	bgColor?: string;
}) => {
	if (!value) return null;

	return (
		<Box
			className={`col-span-${colSpan} flex gap-4 py-4 px-6 rounded-md`}
			sx={{
				border: (theme) => `1px solid ${theme.palette.separator.dark}`
			}}
		>
			<Box
				className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
				sx={{
					background: (theme) => bgColor || theme.palette.primary.light
				}}
			>
				{Icon}
			</Box>
			<Box>
				<Typography variant='subtitle2' color='text.middle' className='mb-1.5!'>
					{label}
				</Typography>
				<Typography variant='subtitle1'>{renderHtml(value)}</Typography>
			</Box>
		</Box>
	);
};

export default function CheckTestPaperRoot({ type }: { type?: string }) {
	const navigate = useNavigate();
	const theme = useTheme();
	const { id, resultId } = useParams();
	const { data } = useGetQuestionsListInTestQuery({
		id: Number(id),
		resultId: Number(resultId)
	});

	const questions = data?.data?.data ?? [];


	if (type === "subjective") {
		return (
			<div className="subjective__question__root">
				{questions.map((item, index) => (
					<Box key={item.id}>
						<Box className="question">
							<div className="question flex justify-between items-start flex-wrap gap-4 mb-5!">
								<Typography variant="subtitle1" color="text.dark" className="lg:max-w-[80%]">
									{renderHtml(item.question)}
								</Typography>
								<Button variant='contained' color='primary' onClick={() => navigate(PATH.TEST_QUESTION_MANAGEMENT.TEST.CHECK_PAPER.CHECK_SUBJECTIVE_QUESTION.ROOT(Number(id), Number(resultId), Number(item.id)))}>
									View/Check Answer
								</Button>
							</div>

							<Box
								className="answer__wrapper py-2 px-3 rounded-lg"
								sx={{
									border: (theme) => `1px solid ${theme.palette.separator.dark}`
								}}
							>
								<Typography variant='caption' color='text.middle'>
									Answer Details
								</Typography>

								<Box className="flex flex-col md:grid md:grid-cols-2 gap-y-4 gap-x-8 mt-4">
									<DetailItem
										icon={<Calendar color={theme.palette.primary.main} />}
										label="Submitted at:"
										value={formatDateTime(item?.submitted_at)}
										bgColor={theme.palette.primary.light}
									/>

									<DetailItem
										icon={<Calendar color={theme.palette.success.main} />}
										label="Marks Obtained:"
										value={item?.mark_obtained?.toString()}
										bgColor={theme.palette.success.light}

									/>

									<DetailItem
										icon={<UserEdit color={theme.palette.warning.main} />}
										label="Checked by:"
										value={item?.checked_by}
										bgColor={theme.palette.warning.light}

									/>

									<DetailItem
										icon={<Timer color={theme.palette.info.main} />}
										label="Checked at:"
										value={formatDateTime(item?.checked_at)}
										bgColor={theme.palette.info.light}

									/>

									<DetailItem
										icon={<UserTag color={theme.palette.primary.main} />}
										label="Teacher's Feedback"
										value={item?.feedback}
										colSpan={2}
										bgColor={theme.palette.primary.light}

									/>
								</Box>

								{item?.media_files?.length ? (
									<>
										<Typography variant='caption' color='text.middle' className='mt-4! block'>
											Answer Image
										</Typography>
										<Box className="answer__image mt-2">
											<div className="grid grid-cols-3 gap-4">
												{item.media_files.map((file) => (
													<div className="col-span-1" key={file.id}>
														<img
															src={file.url}
															alt="Answer submission"
															className='rounded-sm w-full h-full object-cover'
														/>
													</div>
												))}
											</div>
										</Box>
									</>
								) : ""}
							</Box>
						</Box>

						{index < questions.length - 1 && (
							<Box
								className="my-6!"
								sx={{
									borderBottom: (theme) => `1px solid ${theme.palette.separator.dark}`
								}}
							/>
						)}
					</Box>
				))}
			</div>
		);
	}

	return (
		<div className="mcq__question__root">
			{questions.map((item) => (
				<div className="question mb-8!" key={item.id}>
					<div className="flex items-center gap-2 mb-5!">
						<QuestionIssueDot question={item} reserveSpace={false} />
						<Typography variant="subtitle1" color="text.dark">
							{renderHtml(item.question)}
						</Typography>
					</div>

					<div className="flex flex-col gap-5 md:grid md:grid-cols-2">
						{item.options?.map((option, index) => {
							const isCorrectAnswer = option.is_correct;
							const isUserAnswer = option.id === item.your_answer_id;
							const isWrongAnswer = isUserAnswer && !isCorrectAnswer;

							return (
								<Box
									key={index}
									className="col-span-1 py-2 px-3 rounded-lg flex items-center gap-2"
									sx={(theme) => getAnswerStyle(isCorrectAnswer, isWrongAnswer, theme)}
								>
									<OptionIcon isCorrect={isCorrectAnswer} isWrong={isWrongAnswer} />
									<Typography variant="body1" color="text.dark" sx={{ flex: 1 }}>
										{renderHtml(option.option)}
									</Typography>
								</Box>
							);
						})}
					</div>

					<AnswerStatusBadge type={item.type} />
				</div>
			))}
		</div>
	);
}