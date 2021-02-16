import * as React from 'react';
import {useState} from 'react';
import {Button, Card, Input, Layout as AntdLayout} from 'antd';
import {observer} from "mobx-react-lite";
import Diagram, {createSchema, useSchema} from 'beautiful-react-diagrams/dist'
import appStore from "../store";
import {end, few, single, start, str} from "../blocks";
import {randomString} from "../utils/randomString";
import FileSaver from "file-saver";

const {Content, Footer, Sider} = AntdLayout;

export const Layout = observer(() => {
    const initialSchema = createSchema({
        nodes: [
            start(),
            end()
        ]
    });

    const blockTypes = {
        'Один ответ': 'radio',
        'Несколько ответов': 'checklist',
        'Текстовый ответ': 'string',
        'Начало': 'start',
        'Конец': 'end',
    }

    const [schema, controller] = useSchema(initialSchema);
    const [selectedNode, setSelectedNode] = useState<any>(null);

    const onSelectNode = ({id, content}: { id: string, content: string }) => {
        if (!appStore.findInfo(id)) {
            appStore.additionalInfo.push({id, answers: [], isStringAnswer: content === 'Текстовый ответ', question: ''})
        }
        setSelectedNode({id, content, info: appStore.findInfo(id)});
    }

    const onChangeAnswer = (e: any, index: number) => {
        const targetIndex = appStore.additionalInfo.findIndex(i => i.id === selectedNode.id);
        appStore.additionalInfo[targetIndex].answers[index] = e.target.value;

        setSelectedNode((prev) => {
            return {...prev, info: appStore.additionalInfo[targetIndex]}
        })
    }

    const onChangeQuestion = (e) => {
        const targetIndex = appStore.additionalInfo.findIndex(i => i.id === selectedNode.id);
        appStore.additionalInfo[targetIndex].question = e.target.value;

        setSelectedNode((prev) => {
            return {...prev, info: appStore.additionalInfo[targetIndex]}
        })
    }

    const createJSON = () => {
        const jsonchik = schema.nodes.map(node => {
            const result: any = {
                type: blockTypes[node.content],
                id: node.id,
            }

            if(node.content !== 'Начало' && node.content !== 'Конец') {
                result.question = appStore.findInfo(node.id)?.question;
            }

            // функция поиска nextStep для всех кроме radio
            if(node.content !== 'Один ответ') {
                const targetLink = schema.links.find(link => {
                    if (!node.outputs) return false;

                    return link.output === node.outputs[0].id
                });


                if (targetLink) {
                    result.nextStep = schema.nodes.find(n => {
                        if (!n.inputs) return false;

                        return targetLink.input === n.inputs[0].id;
                    }).id
                }
                if(node.content === 'Несколько ответов') {
                    result.answers = appStore.findInfo(node.id)?.answers.map(ans => ({answer: ans}));
                }
            }else {
                // функция поиска nextStep для radio
                const allLinks = schema.links.filter(link => {
                    if (!node.outputs) return false;

                    return node.outputs.find(item => item.id === link.output)
                })

                if (allLinks.length) {
                    result.answers = allLinks.map((link, index) => {
                        return {nextStep: schema.nodes.find(n => {
                            if (!n.inputs) return false;
                            return link.input === n.inputs[0].id;
                        }).id, answer: appStore.findInfo(node.id).answers[index]}
                    })
                }


                // result.answers =
            }

            return result
        })
        var file = new File([JSON.stringify(jsonchik)], "quiz.json", {type: "text/json;charset=utf-8"});
        FileSaver.saveAs(file);
    }

    // @ts-ignore
    return (
        <AntdLayout style={{height: '100vh'}}>
            <Sider
                style={{background: '#eeeeee', padding: '24px 16px 0'}}
                width={240}
                breakpoint="lg"
                collapsedWidth="0"
            >
                <Card size="small" onClick={() => controller.addNode(start())}>Начало опроса</Card>
                <Card size="small" onClick={() => controller.addNode(end())}>Конец опроса</Card>
                <Card size="small" onClick={() => controller.addNode(str())}>Текстовый ответ</Card>
                <Card size="small" onClick={() => controller.addNode(few())}>Несколько ответов</Card>
                <Card size="small" onClick={() => controller.addNode(single())}>Один ответ</Card>

                <div style={{marginTop: 24}}>
                    {selectedNode &&
                    <div>
                        <h3 style={{textAlign: 'center'}}>
                            {selectedNode.content}_{selectedNode.id}
                        </h3>
                        {selectedNode.content !== 'Начало' && selectedNode.content !== 'Конец' && (
                            <>
                                <div style={{marginTop: 16, marginBottom: 16}}>
                                    <h4>Вопрос</h4>
                                    <Input multiple value={selectedNode.info.question} onChange={onChangeQuestion}/>
                                </div>
                                {!selectedNode.info.isStringAnswer &&
                                <>
                                    <h4>Ответы</h4>
                                    {appStore.findInfo(selectedNode.id)?.answers.map((a: string, index) => {
                                        return <Input
                                            value={selectedNode.info.answers[index]}
                                            onChange={(e) => onChangeAnswer(e, index)}/>
                                    })}
                                    <Button style={{width: '100%'}} onClick={() => {
                                        if (selectedNode.content === 'Один ответ') {
                                            const newSchema = Object.assign({}, schema);
                                            const targetNodeIndex = newSchema.nodes.findIndex((i: any) => i.id === selectedNode.id);
                                            if (targetNodeIndex === -1) return;
                                            const newNode = Object.assign({}, newSchema.nodes[targetNodeIndex]);
                                            newNode.outputs.push({id: randomString(20), alignment: "right"})
                                            newSchema.nodes[targetNodeIndex] = newNode;
                                            controller.onChange(newSchema);
                                            appStore.findInfo(selectedNode.id)?.answers.push('');
                                        } else {
                                            appStore.findInfo(selectedNode.id)?.answers.push('');
                                            controller.onChange(schema);
                                        }
                                    }}>Добавить ответ</Button>
                                </>}
                            </>)}
                    </div>
                    }
                </div>
            </Sider>
            <AntdLayout>
                <Content style={{margin: '24px 16px 0', background: '#fff'}}>
                    <Diagram
                        schema={schema}
                        onChange={(e: any) => {
                            controller.onChange(e)
                        }}
                        onSelectNode={onSelectNode}
                    />
                </Content>
                <Footer style={{textAlign: 'center'}}>
                    Quiz Visual Maker 2.0 ©2020 Created by Posline
                    <Button onClick={createJSON}>get JSON</Button>
                </Footer>
            </AntdLayout>
        </AntdLayout>
    );
});
