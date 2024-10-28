import HeaderBox from '@/components/HeaderBox'
import RightSidebarClient from '@/components/RightSidebarClient';
import TotalBalanceBoxClient from '@/components/TotalBalanceBoxClient';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { redirect } from 'next/navigation';

const ClientDashboard = async () => {
  const response = await getLoggedInUser();
  
  // Handle authentication and authorization
  if (!response || response.status === 'error' || !response.data) {
    redirect('/sign-in');
  }

  const user = response.data;
  
  // Ensure user is an admin
  if (user.role !== 'client') {
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
            subtext="Access and manage your Clients, Projects, and Shifts."
          />

          <TotalBalanceBoxClient 
            accounts={[]}
            totalBanks={1}
            totalCurrentBalance={1250.35}
          />
        </header>

        RECENT TRANSACTIONS
      </div>

      <RightSidebarClient 
        user={user as BaseUser & { role: 'client' }}
       /* transactions={[]}
        banks={[]}*/
      />
    </section>
  )
}

export default ClientDashboard