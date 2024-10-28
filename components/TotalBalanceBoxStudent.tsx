// TotalBalanceBoxStudent.tsx
import AnimatedCounterStudent from './AnimatedCounterStudent';
import DoughnutChartStudent from './DoughnutChartStudent';

const TotalBalanceBoxStudent = ({ projectStats }: TotalBalanceBoxStudentProps) => {
  return (
    <section className="total-balance">
      <div className="total-balance-chart">
        <DoughnutChartStudent projects={projectStats.projectEarnings} />
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="header-2">
          Projects: {projectStats.totalProjects}
        </h2>
        <div className="flex flex-col gap-2">
          <p className="total-balance-label">
            Total Monthly Earnings
          </p>

          <div className="total-balance-amount flex-center gap-2">
            <AnimatedCounterStudent amount={projectStats.totalMonthlyEarnings} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default TotalBalanceBoxStudent