/* eslint-disable react/prop-types */
const AdminLayout = ({ children }) => {
	return (
		<>
			<NavbarAdmin />
			<div className='bg-[#eee] h-screen'>{children}</div>
		</>
	);
};

export default AdminLayout;
