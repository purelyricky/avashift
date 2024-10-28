import HeaderBox from '@/components/HeaderBox'
import RightSidebarAdmin from '@/components/RightSidebarAdmin';
import TotalBalanceBoxAdmin from '@/components/TotalBalanceBoxAdmin';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { redirect } from 'next/navigation';

const AdminDashboard = async () => {
  const response = await getLoggedInUser();
  
  // Handle authentication and authorization
  if (!response || response.status === 'error' || !response.data) {
    redirect('/sign-in');
  }

  const user = response.data;
  
  // Ensure user is an admin
  if (user.role !== 'admin') {
    redirect('/'); // or to appropriate error page
  }

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox 
            type="greeting"
            title="Welcome,"
            user={`${user.firstName}`}
            subtext="Access and manage your Clients, Projects, and Shifts Easily."
          />

          <TotalBalanceBoxAdmin 
            accounts={[]}
            totalBanks={1}
            totalCurrentBalance={1250.35}
          />
        </header>
      </div>

      <RightSidebarAdmin 
        user={user as BaseUser & { role: 'admin' }}
       /* transactions={[]}
        banks={[]}*/
      />
    </section>
  )
}

export default AdminDashboard