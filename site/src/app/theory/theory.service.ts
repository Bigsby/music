import { Injectable } from "@angular/core";
import { Topic, TopicContent } from "./theory.models";

import { IDataService, ILogger } from "./../_common/common.interfaces";
import { forEach } from "@angular/router/src/utils/collection";

@Injectable()
export class TheoryService {
    constructor(
        private data: IDataService,
        private logger: ILogger
    ) {
        this.logger = this.logger.forContext(TheoryService);
    }

    getTopics(): Promise<Topic[]> {
        return this.data.getList(Topic)
            .then(topics => {
                this.setProperties(null, topics);
                return topics;
            });
    }

    getContent(id: string): Promise<TopicContent> {
        return this.getTopics()
            .then(response => this.getContentForTopic(this.findTopic(id, response)));
    }

    private getContentForTopic(topic: Topic): Promise<TopicContent> {
        return this.data.getSingle(TopicContent, topic.id)
            .then(content => {
                content.topic = topic;
                return content;
            });
    }

    private findTopic(id: string, topics: Topic[]): Topic {

        if (!topics)
        {
            return null;
        }

        var topic = topics.find(t => t.id == id);
        if (topic)
            return topic;
        
        for (let topicIndex = 0; topicIndex < topics.length; topicIndex++) {
            const innerTopic = topics[topicIndex];
            let foundTopic = this.findTopic(id, innerTopic.subTopics);

            if (foundTopic){
                return foundTopic;
            }
        }

        return null;
    }

    private setProperties(parent: Topic, topics: Topic[]) {
        if (topics) {
            topics.forEach((topic, index) => {
                topic.id = (parent ? parent.id + "." : "") + topic.id;
                topic.index = index;
                topic.parent = parent;
                topic.path = this.getPath(parent);
                this.setProperties(topic, topic.subTopics);
            });
        }
    }

    private getPath(parent: Topic): Topic[] {
        var result = [];

        if (parent) {
            if (parent.path) {
                result.concat(parent.path);
            }

            result.push(parent);
        }

        return result;
    }
}