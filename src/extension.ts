// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// ローカライズしたJSONファイルを取り込む。
const langJa = require('../package.nls.ja.json');
const langEn = require('../package.nls.json');

// 時間を扱うライブラリ
var moment = require('moment');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// 計測中？
	let isTimerRun = false;
	// 値
	let time = 0;
	// setIntervalの戻り値。clearIntervalするときに必要。
	let interval: NodeJS.Timer;

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "rtavscode" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	// 起動コマンド登録？
	context.subscriptions.push(vscode.commands.registerCommand('rtavscode.stopwatch', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage(localize('description'));
	}));


	// ステータスバーに表示
	const rta = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	rta.command = "rtavscode.switch";
	rta.text = "00:00:00";
	rta.show();
	// ステータスバーに表示した項目を押すことでコマンドが実行されるので実行したい内容を入れる
	context.subscriptions.push(vscode.commands.registerCommand('rtavscode.switch', async () => {
		let selected;
		if (!isTimerRun) {
			// まだ実行したことない or リセットした
			selected = await vscode.window.showInformationMessage(localize('menu'), localize('start'), localize('reset'));
		} else {
			// 実行中でリセット or 一時停止したい。
			selected = await vscode.window.showInformationMessage(localize('menu'), localize('pause'), localize('reset'));
		}
		if (selected?.match(localize('start'))) {
			// 開始
			isTimerRun = true;
			vscode.window.showInformationMessage(localize('start'));
			interval = setInterval(() => {
				time++;
				// UNIXで。
				let momentJS = moment.unix(time);
				// utc()を付けてタイムゾーンを無視する（日本で開くとタイムゾーンのせいで九時間足されているため）
				rta.text = momentJS.utc().format("HH:mm:ss");
				rta.show();
			}, 1000);
		} else if (selected?.match(localize('pause'))) {
			// 一時停止
			isTimerRun = false;
			vscode.window.showInformationMessage(localize('pause'));
			clearInterval(interval);
		} else if (selected?.match(localize('reset'))) {
			// リセット
			isTimerRun = false;
			time = 0;
			if (interval !== undefined) { clearInterval(interval); }
			rta.text = "00:00:00";
			rta.show();
			// 起動コマンド実行（多分する必要性ない。）
			vscode.commands.executeCommand('rtavscode.stopwatch');
		}
	}));

	/** 言語を返す。 */
	const getLang = (): string => JSON.parse(process.env.VSCODE_NLS_CONFIG as string).locale;

	/** ローカライズの内容があるJSONファイルから取得する。
	 * @param key JSONのKey
	 */
	const localize = (key: string): string => {
		if (getLang() === 'ja') {
			return langJa[key];
		} else {
			return langEn[key];
		}
	};

}



// this method is called when your extension is deactivated
export function deactivate() { }


