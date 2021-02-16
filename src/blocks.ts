import {randomString} from "./utils/randomString";

export const end = () => {
    return {
        id: randomString(20),
        content: 'Конец',
        inputs: [{id: randomString(20), alignment: "left"}],
        coordinates: [0, 0],
    }
}

export const start = () => {
    return {
        id: randomString(20),
        content: 'Начало',
        outputs: [{id: randomString(20), alignment: "right"}],
        coordinates: [0, 0],
    }
}

export const single = () => {
    return {
        id: randomString(20),
        content: 'Один ответ',
        inputs: [{id: randomString(20), alignment: "left"}],
        outputs: [],
        coordinates: [0, 0],
    }
}

export const few = () => {
    return {
        id: randomString(20),
        content: 'Несколько ответов',
        inputs: [{id: randomString(20), alignment: "left"}],
        outputs: [{id: randomString(20), alignment: "right"}],
        coordinates: [0, 0],
    }
}

export const str = () => {
    return {
        id: randomString(20),
        content: 'Текстовый ответ',
        inputs: [{id: randomString(20), alignment: "left"}],
        outputs: [{id: randomString(20), alignment: "right"}],
        coordinates: [0, 0],
    }
}

