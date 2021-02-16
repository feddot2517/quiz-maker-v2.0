import {action, observable} from 'mobx'
import {randomString} from "./utils/randomString";

interface IAdditionalInfo {
    id: string,
    question: string,
    answers: Array<string>,
    isStringAnswer: boolean,
}

class AppStore {
    @observable additionalInfo = Array<IAdditionalInfo>();
    @action findInfo = (id: string) => {
        const info = this.additionalInfo.find(i => i.id === id)
        if(info) return info
        else return null
    }
    @action updateAnswer = (nodeId, answerIndex, value) => {
        const index = this.additionalInfo.findIndex(i=>i.id==nodeId);
        this.additionalInfo[index].answers[answerIndex] = value;
    }
}

const appStore = new AppStore();

export default appStore;
