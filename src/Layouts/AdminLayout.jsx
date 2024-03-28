import NavbarAdmin from '../components/Admin/NavbarAdmin';

/* eslint-disable react/prop-types */
const AdminLayout = ({ children }) => {
	return (
		<>
			<NavbarAdmin />
			<div className='bg-[#eee]'>{children}</div>
		</>
	);
};

export default AdminLayout;
