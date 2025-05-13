import React from 'react';
import { motion } from 'framer-motion';

const AppointmentBooking = () => {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.5 }}
		>
			<motion.div className="container mx-auto p-4">
				<motion.h1 className="text-2xl font-bold mb-4">
					Book an Appointment
				</motion.h1>
				<motion.form className="space-y-4">
					<motion.div>
						<iframe
							src="https://calendly.com/ambreenambi04/30min"
							width="100%"
							height="630"
							frameBorder="0"
							title="Schedule Appointment"
						></iframe>
					</motion.div>
				</motion.form>
			</motion.div>
		</motion.div>
	);
};

export default AppointmentBooking;
