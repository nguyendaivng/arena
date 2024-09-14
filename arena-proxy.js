const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { DateTime } = require('luxon');
const colors = require('colors');
const readline = require('readline');
const { HttpsProxyAgent } = require('https-proxy-agent');

class ArenaGames {

    constructor() {
        this.proxies = this.loadProxies();
    }

    loadProxies() {
        const proxyFile = path.join(__dirname, 'proxyall.txt');
        return fs.readFileSync(proxyFile, 'utf8')
            .replace(/\r/g, '')
            .split('\n')
            .filter(Boolean);
    }

    parseIdFileContent(content) {
        const userMatch = content.match(/user=%7B%22id%22%3A(\d+)/);
        const userId = userMatch ? userMatch[1] : null;
        const tg = content;
        return { userId, tg };
    }
	
    headers(id,tg) {
		return {
			"Accept": "application/json, text/plain, */*",
			"Accept-Encoding": "gzip, deflate, br, zstd",
			"Accept-Language": "en-US,en;q=0.9",
			"At": `${id}`,
			"Origin": "https://bot-coin.arenavs.com",
			"Priority": "u=1, i",
			"Referer": "https://bot-coin.arenavs.com/",
			"Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
			"Sec-Ch-Ua-Mobile": "?1",
			"Sec-Ch-Ua-Platform": '"Android"',
			"Sec-Fetch-Dest": "empty",
			"Sec-Fetch-Mode": "cors",
			"Sec-Fetch-Site": "same-site",
			"User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
			"Tg": tg
			}
    }

    async getProfile(id, tg, proxy) {
        const url = "https://bot.arenavs.com/v1/profile";
        const headers = this.headers(id, tg);
        const proxyAgent = new HttpsProxyAgent(proxy);
        return axios.get(url, { headers, httpsAgent: proxyAgent });
    }

    async getTask(id, tg, proxy) {
        const url = "https://bot.arenavs.com/v1/profile/tasks?page=1&limit=20";
        const headers = this.headers(id, tg);
        const proxyAgent = new HttpsProxyAgent(proxy);
        return axios.get(url, { headers, httpsAgent: proxyAgent });
    }

    async doTask(id, tg, taskId, proxy) {
        const url = `https://bot.arenavs.com/v1/profile/tasks/${taskId}`;
        const headers = this.headers(id, tg);
        const proxyAgent = new HttpsProxyAgent(proxy);
        return axios.post(url, null, { headers, httpsAgent: proxyAgent });
    }

    async claimTask(id, tg, taskId, proxy) {
        const url = `https://bot.arenavs.com/v1/profile/tasks/${taskId}/claim`;
        const headers = this.headers(id, tg);
        const proxyAgent = new HttpsProxyAgent(proxy);
        return axios.post(url, null, { headers, httpsAgent: proxyAgent });
    }

    async farmCoin(id, tg, proxy) {
        const url = "https://bot.arenavs.com/v1/profile/farm-coin";
        const headers = this.headers(id, tg);
        const proxyAgent = new HttpsProxyAgent(proxy);
        return axios.post(url, null, { headers, httpsAgent: proxyAgent });
    }

    async checkRefCoin(id, tg, proxy) {
        const url = "https://bot.arenavs.com/v1/profile/refs/coin";
        const headers = this.headers(id, tg);
        const proxyAgent = new HttpsProxyAgent(proxy);
        return axios.get(url, { headers, httpsAgent: proxyAgent });
    }

    async getRefCoin(id, tg, proxy) {
        const url = "https://bot.arenavs.com/v1/profile/get-ref-coin";
        const headers = this.headers(id, tg);
        const proxyAgent = new HttpsProxyAgent(proxy);
        return axios.post(url, null, { headers, httpsAgent: proxyAgent });
    }

    async attemptsLeft(id, tg, proxy) {
        const url = "https://bot.arenavs.com/v1/game/attempts-left";
        const headers = this.headers(id, tg);
        const proxyAgent = new HttpsProxyAgent(proxy);
        const response = await axios.get(url, { headers, httpsAgent: proxyAgent });
        return response;
    }

    async startGame(id, tg, proxy) {
        const url = "https://bot.arenavs.com/v1/game/start";
        const headers = this.headers(id, tg);
        const proxyAgent = new HttpsProxyAgent(proxy);
        return axios.post(url, null, { headers, httpsAgent: proxyAgent });
    }

    async stopGame(id, tg, gameData, proxy) {
        const url = "https://bot.arenavs.com/v1/game/stop";
        const headers = this.headers(id, tg);
        const proxyAgent = new HttpsProxyAgent(proxy);

        const payload = {
            xp: gameData.xp,
            height: gameData.height,
            somersault: gameData.somersault,
            time: "60000",
        };

        headers["Content-Length"] = JSON.stringify(payload).length;
        headers["Content-Type"] = "application/json";

        return axios.post(url, payload, { headers, httpsAgent: proxyAgent });
    }

    async playGame(id, tg, proxy) {
        this.log(`${'Bắt đầu chơi game...'.yellow}`);
        const startGame = await this.startGame(id, tg, proxy);
        const gameData = {
            xp: Math.floor(Math.random() * (1000 - 500 + 1)) + 500,
            height: Math.floor(Math.random() * (35 - 20 + 1)) + 20,
            somersault: Math.floor(Math.random() * (80 - 50 + 1)) + 50,
        };

        try {
            const startStatus = startGame.data.data.status;
            if (startStatus) {
                await this.waitGame(60);
                const stopGame = await this.stopGame(id, tg, gameData, proxy);
                const stopStatus = stopGame.data.data.status;
                if (stopStatus) {
                    this.log(`${'XP kiếm được:'.green} ${gameData.xp}`);
                    this.log(`${'Chiều cao:'.green} ${gameData.height}`);
                    this.log(`${'Nhảy lộn nhào:'.green} ${gameData.somersault}`);
                } else {
                    this.log(`${'Lỗi rồi'.red}`);
                    return false;
                }
            } else {
                this.log(`${'Không thể bắt đầu game'.red}`);
                return false;
            }
        } catch (error) {
            const stopGame = await this.stopGame(id, tg, gameData, proxy);
            const stopStatus = stopGame.data.data.status;
            if (stopStatus) {
                this.log(`${'XP kiếm được:'.green} ${gameData.xp}`);
                this.log(`${'Chiều cao:'.green} ${gameData.height}`);
                this.log(`${'Nhảy lộn nhào:'.green} ${gameData.somersault}`);
            } else {
                this.log(`${'Lỗi rồi'.red}`);
                return false;
            }
        }
    }

    async getBoosterStatus(id, tg, proxy) {
        const url = "https://bot.arenavs.com/v1/booster/active";
        const headers = this.headers(id, tg);
        const proxyAgent = new HttpsProxyAgent(proxy);
        return axios.get(url, { headers, httpsAgent: proxyAgent });
    }

    async getBoosters(id, tg, proxy) {
        const url = "https://bot.arenavs.com/v1/booster";
        const headers = this.headers(id, tg);
        const proxyAgent = new HttpsProxyAgent(proxy);
        return axios.get(url, { headers, httpsAgent: proxyAgent });
    }

    async buyBooster(id, tg, boosterId, proxy) {
        const url = "https://bot.arenavs.com/v1/booster/buy";
        const headers = this.headers(id, tg);
        headers["Content-Type"] = "application/json";

        const payload = { id: boosterId };
        const proxyAgent = new HttpsProxyAgent(proxy);
        return axios.post(url, payload, { headers, httpsAgent: proxyAgent });
    }

	async handleBooster(id, tg, balance, proxy) {
		const boosterStatus = await this.getBoosterStatus(id, tg, proxy);
		const boosterData = boosterStatus.data.data.booster;
		const currentTime = new Date();

		if (!boosterData || new Date(boosterData.exp) < currentTime) {
			const boosters = await this.getBoosters(id, tg, proxy);
			const activeBoosters = boosters.data.data.active;

			if (activeBoosters && activeBoosters.length > 0) {
				if (balance >= activeBoosters[0].price) {
					const boosterId = activeBoosters[0].id;
					const buyBooster = await this.buyBooster(id, tg, boosterId, proxy);
					const boosterBuyData = buyBooster.data.data;

					if (boosterBuyData) {
						this.log(`${'Đã mua Booster thành công'.green}`);
					} else {
						this.log(`${'Không thể mua Booster'.red}`);
					}
				} else {
					this.log(`${'Không đủ balance để mua Booster'.red}`);
				}
			} else {
				this.log(`${'Booster đang hoạt động!'.red}`);
			}
		} else {
			this.log(`${'Booster đang hoạt động, không thể mua Booster mới!'.red}`);
		}
	}



    askQuestion(query) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        return new Promise(resolve => rl.question(query, ans => {
            rl.close();
            resolve(ans);
        }))
    }

    log(msg) {
        console.log(`[*] ${msg}`);
    }

    async waitWithCountdown(seconds) {
        for (let i = seconds; i >= 0; i--) {
            readline.cursorTo(process.stdout, 0);
            process.stdout.write(`===== Đã hoàn thành tất cả tài khoản, chờ ${i} giây để tiếp tục vòng lặp =====`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log('');
    }
    async waitGame(seconds) {
        for (let i = seconds; i >= 0; i--) {
            readline.cursorTo(process.stdout, 0);
            process.stdout.write(`[*] Cần chờ ${i} giây để hoàn thành`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log('');
    }
    async checkProxyIP(proxy) {
        try {
            const proxyAgent = new HttpsProxyAgent(proxy);
            const response = await axios.get('https://api.ipify.org?format=json', {
                httpsAgent: proxyAgent
            });
            if (response.status === 200) {
                return response.data.ip;
            } else {
                throw new Error(`Không thể kiểm tra IP của proxy. Status code: ${response.status}`);
            }
        } catch (error) {
            throw new Error(`Error khi kiểm tra IP của proxy: ${error.message}`);
        }
    }

	async main() {
		const dataFile = path.join(__dirname, 'arena.txt');
		const data = fs.readFileSync(dataFile, 'utf8')
			.replace(/\r/g, '')
			.split('\n')
			.filter(Boolean);

		const buybooster = await this.askQuestion('Bạn có muốn mua booster không? (y/n): ');
		const buyboosterDecision = buybooster.toLowerCase() === 'y';

		while (true) {
			const endAtList = [];

			for (let no = 0; no < data.length; no++) {
				const content = data[no];
				const { userId, tg } = this.parseIdFileContent(content);
				const proxy = this.proxies[no];

				let proxyIP = '';
				try {
					proxyIP = await this.checkProxyIP(proxy);
				} catch (error) {
					console.error('Lỗi khi kiểm tra IP của proxy:', error);
				}

                try {
                    const getProfile = await this.getProfile(userId, tg, proxy);
                    const userName = getProfile.data.data.first_name;
                    const balance = getProfile.data.data.balance.$numberDecimal;
                    const endAt = getProfile.data.data.farmEnd / 1000;
                    const readableTime = DateTime.fromSeconds(endAt).toFormat('yyyy-MM-dd HH:mm:ss');
                    console.log(`========== Tài khoản ${no + 1} | ${userName.green} | IP: ${proxyIP} ==========`);
                    this.log(`${'Balance:'.green} ${parseFloat(balance).toFixed(2).white}`);
                    this.log(`${'Thời gian hoàn thành farm:'.green} ${readableTime.white}`);
                    endAtList.push(endAt);
                    
                    if (buyboosterDecision) {
                        await this.handleBooster(userId, tg, balance, proxy);
                    }
                } catch (error) {
                    this.log(`${'Lỗi thông tin người dùng'.red}`);
                    console.log(error);
                }


                try {
                    const getTask = await this.getTask(userId, tg, proxy);
                    const tasks = getTask.data.data.docs;
                    const taskInfo = tasks.map(task => ({
                        task_id: task._id,
                        task_name: task.title,
                        task_status: task.status
                    }));

                    const pendingTasks = taskInfo.filter(task => task.task_status === 'pending');
                    if (pendingTasks.length > 0) {
                        for (const task of pendingTasks) {
                            const result = (await this.doTask(userId, tg, task.task_id, proxy)).data.data.status;
                            this.log(`${task.task_name.white}: ${'Đang làm nhiệm vụ...'.yellow} ${'Trạng thái:'.white} ${result.yellow}`);
                        }
                    }

                    const completedTasks = taskInfo.filter(task => task.task_status === 'completed');
                    if (completedTasks.length > 0) {
                        for (const task of completedTasks) {
                            const result = (await this.claimTask(userId, tg, task.task_id, proxy)).data.data.status;
                            this.log(`${task.task_name.white}: ${'Hoàn thành nhiệm vụ...'.yellow} ${'Trạng thái:'.white} ${result.yellow}`);
                        }
                    }

                    const claimTasks = taskInfo.filter(task => task.task_status === 'claim');
                    if (claimTasks.length > 0) {
                        for (const task of claimTasks) {
                            this.log(`${task.task_name.white}: ${'Hoàn thành'.green}`);
                        }
                    }
                } catch (error) {
                    this.log(`${'Lỗi khi nhận nhiệm vụ'.red}`);
                }

                try {
                    this.log(`${'Bắt đầu farm...'.yellow}`);
                    const farmCoin = await this.farmCoin(userId, tg, proxy);
                    if (farmCoin.data.statusCode === 400) {
                        this.log(`${'Đang trong trạng thái farm'.yellow}`);
                    } else if (farmCoin.data.status === 'ok') {
                        this.log(`${'Farm thành công'.yellow}`);
                    }

                    const getProfile = await this.getProfile(userId, tg, proxy);
                    const balance = getProfile.data.data.balance.$numberDecimal;
                    this.log(`${'Số dư hiện tại:'.green} ${parseFloat(balance).toFixed(2).white}`);
                } catch (error) {
                    this.log(`${'Chưa đến giờ'.red}`);
                }

                try {
                    const checkRefCoin = await this.checkRefCoin(userId, tg, proxy);
                    const refCoin = checkRefCoin.data.data.allCoin.$numberDecimal;
                    if (parseInt(refCoin) > 0) {
                        this.log(`${'Đã nhận'.yellow} ${parseInt(refCoin)} ${'XP từ bạn bè...'.yellow}`);
                        const getRefCoin = await this.getRefCoin(userId, tg, proxy);
                        const balance = getRefCoin.data.data.balance.$numberDecimal;
                        this.log(`${'Số dư hiện tại:'.green} ${parseFloat(balance).toFixed(2).white}`);
                    }
                } catch (error) {
                    this.log(`${'Lỗi khi kiểm tra xp từ bạn bè'.red}`);
                }

                try {
                    while (true) {
                        const attemptsLeft = await this.attemptsLeft(userId, tg, proxy);
                        const gameLeft = attemptsLeft.data.data.quantity;
                        this.log(`${'Vé trò chơi:'.green} ${gameLeft}`);
                        if (parseInt(gameLeft) > 0) {
                            await this.playGame(userId, tg, proxy);
                            const getProfile = await this.getProfile(userId, tg, proxy);
                            const balance = getProfile.data.data.balance.$numberDecimal;
                            this.log(`${'Số dư hiện tại:'.green} ${parseFloat(balance).toFixed(2).white}`);
                        } else {
                            this.log(`${'Đã chơi hết vé'.yellow}`);
                            break;
                        }
                    }
                } catch (error) {
                    this.log(`${'Lỗi khi chơi game'.red}`);
                }
            }

            let waitTime;
            if (endAtList.length > 0) {
                const now = DateTime.now().toSeconds();
                const waitTimes = endAtList.map(endAt => endAt - now).filter(waitTime => waitTime > 0);
                if (waitTimes.length > 0) {
                    waitTime = Math.min(...waitTimes);
                } else {
                    waitTime = 15 * 60;
                }
            } else {
                waitTime = 15 * 60;
            }
            await this.waitWithCountdown(Math.floor(waitTime));
        }
    }
}

if (require.main === module) {
    const arena = new ArenaGames();
    arena.main().catch(err => {
        console.error(err);
        process.exit(1);
    });
}
