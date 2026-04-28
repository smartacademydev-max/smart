import { Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useBrandSettings } from "../../../../hooks/useBrandSettings";
import { PATH } from "../../../../routes/PATH";
import AuthHeader from "../../../molecules/AuthHeader";
import LoginForm from "../../../organism/LoginForm";

export default function Login({
	requirePassword = false,
}: {
	requirePassword?: boolean;
}) {
	const { brandName } = useBrandSettings();
	return (
		<>
			<AuthHeader
				title={`Welcome to ${brandName} 👋🏻 `}
				description="You're one step closer to exponential growth"
			/>
			<LoginForm requirePassword={requirePassword} />
			{!requirePassword ? (
				<Link to={PATH.AUTH.VERIFY_OTP.ROOT} className="text-end block mt-4">
					<Typography variant="subtitle2">Already have an OTP?</Typography>
				</Link>
			) : null}

			{!requirePassword ? (
				<div className="mt-14 text-center">
					<Typography variant="subtitle2" color="text.light">
						Dont Have an Account ?{" "}
						<Link to={PATH.AUTH.REGISTER.ROOT} className="inline-block">
							<Typography color="primary" variant="subtitle2">
								Register Now
							</Typography>
						</Link>
					</Typography>
				</div>
			) : null}
		</>
	);
}
