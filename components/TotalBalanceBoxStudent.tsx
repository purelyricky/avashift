import AnimatedCounterStudent from './AnimatedCounterStudent';
import DoughnutChartStudent from './DoughnutChartStudent';

const TotalBalanceBoxStudent = ({ projectStats }: { projectStats: StudentProjectStats }) => {
  return (
    <section className="w-full p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <section className="total-balance">
      <div className="total-balance-chart">
        <DoughnutChartStudent projects={projectStats.projectHours} />
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="header-2">
          Projects: {projectStats.totalProjects}
        </h2>
        <div className="flex flex-col gap-2">
          <p className="total-balance-label">
            Total Monthly Hours
          </p>

          <div className="total-balance-amount flex-center gap-2">
            <AnimatedCounterStudent hours={projectStats.totalMonthlyHours} />
          </div>
        </div>
      </div>
    </section>
    <section className="total-balance">
      <div className="total-balance-chart">
        <DoughnutChartStudent projects={projectStats.projectHours} />
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="header-2">
          Projects: {projectStats.totalProjects}
        </h2>
        <div className="flex flex-col gap-2">
          <p className="total-balance-label">
            Total Monthly Hours
          </p>

          <div className="total-balance-amount flex-center gap-2">
            <AnimatedCounterStudent hours={projectStats.totalMonthlyHours} />
          </div>
        </div>
          </div>
        </section>

      </div>

    
    </section>
    
  )
}

export default TotalBalanceBoxStudent;
