import axios from 'axios';
import cheerio from 'cheerio';
import logger from '@shared/Logger';
import {Sense, Word} from '../typings';


const scraper = {
    async fetchWeblio(word: string): Promise<string> {
        const url = `https://www.weblio.jp/content/${encodeURIComponent(word)}`;
        return axios({
            method: 'GET',
            url,
        }).then(response => {
            const html = response.data;
            return html;
        }).catch(err => {
            logger.error(url);
            logger.error(err);
        });
    },

    async getJP(searchWord: string): Promise<Word[]> {
        const html = await scraper.fetchWeblio(searchWord);

        const $ = cheerio.load(html);

        const dHead = $('.NetDicHead');

        const words: Word[] = Array(dHead.length).fill({});

        dHead.each((i, el) => {
            const reading = $(el).find('b').text();
            const accentRegexResult = $(el).text().match(/\d/);
            const altWordRegexResult = $(el).text().match(/【(.*)】/);

            let accent = '';
            let altWords: string[] = [];

            if (accentRegexResult !== null) {
                accent = accentRegexResult[0];
            }

            if (altWordRegexResult !== null) {
                altWords = altWordRegexResult[1].split('・');
            }

            words[i] = {
                ...words[i],
                ...{
                    reading,
                    accent,
                    altWords
                }
            }
        });

        $('.NetDicBody').each((i, el) => {
            const blackNum = $(el).find('.NetDicBody > div > div > div > span > span > div');
            const sectionDef = $(el).find('.NetDicBody > div > div > div > span:nth-child(2) > div');

            if (sectionDef.length > 0) {
                // 2 layer
                sectionDef.each((j, sel) => {
                    const multiDef = $(sel).find('> div > div > span:nth-child(2)');
                    const singleDef = $(sel).find('> div > div > div');

                    let defLine: string[] = [];

                    if (multiDef.length > 0) {
                        defLine = multiDef.map((r, rel) => $(rel).text()).get();
                    } else if (singleDef.length > 0) {
                        defLine = singleDef.map((r, rel) => $(rel).text()).get();
                    }

                    if (words[i].senses === undefined) {
                        words[i].senses = [];
                    }

                    words[i].senses.push({
                        pos: [],
                        definitions: defLine
                    })
                })
            } else {
                // 1 layer
                // 0 layer
                const multiSelector = '.NetDicBody > div:nth-child(1) > div > div > div > div > span:nth-child(2)';
                const singleSelector = '.NetDicBody > div:nth-child(1) > div > div > div';

                const multiDef = $(el).find(multiSelector);
                const singleDef = $(el).find(singleSelector);

                let defLine: string[] = [];

                if (multiDef.length > 0) {
                    defLine = multiDef.map((r, rel) => $(rel).text()).get();
                } else if (singleDef.length > 0) {
                    defLine = singleDef.map((r, rel) => $(rel).text()).get();
                }

                if (words[i].senses === undefined) {
                    words[i].senses = [];
                }

                words[i].senses.push({
                    pos: [],
                    definitions: defLine
                })
            }

        });

        return words;

    },

    async getEN(searchWord: string): Promise<Word[]> {
        const url = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(searchWord)}`;
        return axios.get(url)
            .then(res => {
                const data: any = res.data;
                if (data.meta < 200 || data.meta > 299) {
                    //  bad response
                    return [];
                }
                const words: Word[] = [];

                for (const d of data.data) {
                    const reading: string = d.japanese[0].reading;
                    const altWords: string[] = d.japanese
                        .map((r: any) => r.word)
                        .filter((r: any) => r);

                    const senses: Sense[] = d.senses.map((r: any) => {
                        return {
                            pos: r.parts_of_speech,
                            definitions: r.english_definitions,
                        }
                    });

                    const w = {
                        reading,
                        altWords,
                        accent: '',
                        senses,
                    };

                    words.push(w);
                }

                return words;

            })
            .catch(err => {
                logger.error(url);
                logger.error(err);
                return [];
            });
    }
};


export default scraper;