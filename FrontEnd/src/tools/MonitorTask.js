import apis from '../services/apis'
import MonitorJob from './MonitorJob'

export default class MonitorTask extends MonitorJob {
    constructor(jobID, interval = 1000) {
        super(jobID, interval)
    }

    cancel() {
        console.warn("export job supression not implemented")
    }
    
    async jobMonitoring(jobUuid) {

        let task
        try {
            task = await apis.task.getTask(jobUuid)
        } catch (error) {
            if (error.status === 404) {
                this.stopMonitoringJob()
            }
            return
        }

        this.updateCallBack(task)

        if (task.state === 'completed'||task.state === 'failed') {
            this.stopMonitoringJob()
            this.finishCallback(task)
        }

    }
}
