import { useState, useEffect, ReactNode, useRef } from 'react'
import * as _ from 'lodash'
import './Connect.scss'
const BOARD_SIZE = 14;   // 网格大小
const TYPE_SIZE = 30;    // 图案类型数量
const GAME_STATUS = {
    HOME: 0,
    RUNNING: 1,
    GAME_OVER: 2
};
const patterns = [
    {color:'transparent', pattern:''},
    // 自然系列
    { color: '#FFB3BA', pattern: '❤️' },   // 浅粉红爱心
    { color: '#B8E8FF', pattern: '💧' },   // 淡蓝水滴
    { color: '#FFF3AD', pattern: '🌟' },   // 奶油黄星星
    { color: '#C4E8C2', pattern: '🍀' },   // 薄荷绿四叶草
    { color: '#FFD8A7', pattern: '🔥' },   // 杏橙色火焰
    { color: '#A7E9FF', pattern: '🌊' },   // 淡海蓝波浪
    { color: '#D3F5CF', pattern: '🌿' },   // 新芽绿植物
    { color: '#FFE4E1', pattern: '🐚' },   // 贝壳粉色贝壳
    { color: '#E6F9FF', pattern: '❄️' },   // 冰蓝雪花
    { color: '#FFF0F5', pattern: '🌸' },   // 樱粉樱花

    // 食物系列
    { color: '#FFE5B4', pattern: '🍩' },   // 奶油色甜甜圈
    { color: '#FFDAB9', pattern: '🍳' },   // 蛋黄色煎蛋
    { color: '#F0FFF0', pattern: '🥦' },   // 淡绿西兰花
    { color: '#FFF8DC', pattern: '🍯' },   // 蜂蜜色蜜罐
    { color: '#FFE4E1', pattern: '🍥' },   // 粉红鱼板
    
    // 动物系列
    { color: '#F5F5DC', pattern: '🐻' },   // 米白小熊
    { color: '#E0FFFF', pattern: '🐬' },   // 浅蓝海豚
    { color: '#FFFACD', pattern: '🐥' },   // 淡黄小鸡
    { color: '#F0E68C', pattern: '🦁' },   // 沙色狮子
    { color: '#DCDCDC', pattern: '🐼' },   // 浅灰熊猫

    // 日常物品
    { color: '#B8A9FF', pattern: '🌂' },   // 淡紫雨伞
    { color: '#DCC2FF', pattern: '🎀' },   // 浅紫蝴蝶结
    { color: '#E0E0E0', pattern: '⌚' },    // 浅灰手表
    { color: '#FFC1E3', pattern: '🎈' },   // 粉红气球
    { color: '#FFECB3', pattern: '📖' },   // 浅黄书本

    // 符号系列
    { color: '#C8E6C9', pattern: '✔️' },   // 淡绿对勾
    { color: '#FFCDD2', pattern: '❌' },    // 浅红叉号
    { color: '#B2EBF2', pattern: '➰' },    // 淡蓝波纹线
    { color: '#F8BBD0', pattern: '🎵' },   // 粉红音符
    { color: '#DCEDC8', pattern: '⚡' },    // 浅绿闪电

    // 特殊主题
    { color: '#F3E5F5', pattern: '🎃' },   // 淡紫南瓜
    { color: '#FFF9C4', pattern: '🎄' }    // 浅金圣诞树
];
const reBoxArray = (length: number) => {
    const arr: number[][] = [];
    for (let i = 0; i < length; i++) arr.push([]);
    arr.map((row: number[]) => {
        for (let j = 0; j < length; j++) {
            row.push(0);
        }
    });
    return arr;
}
// 格式化时间
const formatTime = (time: number) => {
    const minute = Math.floor(time / 60);
    const second = time % 60;
    return `${minute}:${second < 10 ? '0' + second : second}`;
}
const shuffleBoard = (board: number[][]) => {
    // 先将二维数组展开
    let arr = _.cloneDeep(board).flat();
    // 打乱数组
    arr = _.shuffle(arr);
    const newBoard: number[][] = [];
    // 重新组合数组
    for (let i = 0; i < BOARD_SIZE; i++) {
        newBoard.push(arr.slice(i * BOARD_SIZE, (i + 1) * BOARD_SIZE))
    }
    return newBoard;
}
// 生成随机的游戏数组
const generateBoard = () => {
    const board: number[][] = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
        board.push([]);
        for (let col = 0; col < BOARD_SIZE / 2; col++) {
            const value = _.random(1, TYPE_SIZE);
            board[row].push(value, value);
        }
    }
    // 打乱数组
    return shuffleBoard(board);
}
const checkSelected = (clickList: number[][], row: number, col: number) => {
    let result = false;
    clickList.forEach((item) => {
        if (item[0] == row && item[1] == col) {
            result = true;
        }
    })
    return result;
}
// 检查是否连接成功
const checkConnect = (board: number[][], clickList: number[][], isGlobal = false) => {
    const [startRow, startCol] = clickList[0];
    let [endRow, endCol] = [0, 0];
    // 判断是不是全局检查存在连接
    if (!isGlobal) {
        [endRow, endCol] = clickList[1]
    }
    const directionList = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    const queue = [[startRow, startCol, -1, [0, 0]]];
    const visited = reBoxArray(BOARD_SIZE);
    while (queue.length > 0) {
        // 横坐标 纵坐标 拐点数量 上一个的方向
        const [row, col, point, lastDirection] = queue.shift() as [number, number, number, number[]];
        visited[row][col] = 1;
        for (let i = 0; i < directionList.length; i++) {
            const direction = directionList[i];
            const nowPoint = point + (direction == lastDirection ? 0 : 1);
            const x = row + direction[0];
            const y = col + direction[1];
            // 越界  不能回头查找  不超过两个拐点
            if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE || x == startRow && y == startCol || nowPoint > 2)
                continue;
            // 判断当前坐标的图案是否与起点相同
            if (board[x][y] == board[startRow][startCol]) {
                if (isGlobal) {
                    console.log(startRow, startCol)
                    console.log(x, y)
                    return true;
                }
                // 如果不是全局检查，则判断终点坐标是否正确
                if (x == endRow && y == endCol) {
                    console.log('当前拐点' + nowPoint);
                    return true;
                }
            }
            if (board[x][y] == 0 && visited[x][y] == 0) {
                queue.push([x, y, nowPoint, direction]);
            }
        }
    }
    return false;
}
const checkGlobalConnect = (board: number[][]) => {
    for (let startRow = 0; startRow < BOARD_SIZE; startRow++) {
        for (let startCol = 0; startCol < BOARD_SIZE; startCol++) {
            if (board[startRow][startCol] == 0) continue;
            if (checkConnect(board, [[startRow, startCol]], true)) {
                return true;
            }
        }
    }
    return false;
}
const checkGameOver = (board: number[][]) => {
    const arr = board.flat();
    // 判断是否所有图案都被消除
    return arr.every((item) => item == 0)
}
export default function Connect() {
    const [board, setBoard] = useState(reBoxArray(BOARD_SIZE));
    const [clickList, setClickList] = useState([] as number[][]);
    const [gameStatus, setGameStatus] = useState(GAME_STATUS.HOME);
    const [remainder, setRemainder] = useState(0);
    const [rankList, setRankList] = useState(JSON.parse(localStorage.getItem('connectRankList') || '[]') as number[]);
    const [time, setTime] = useState(0);
    const timerRef = useRef(0);
    const handleClickItem = (row: number, col: number) => {
        if (gameStatus != GAME_STATUS.RUNNING) return;
        if (board[row][col] == 0) return;
        const newClickList = _.cloneDeep(clickList);
        if (clickList.length == 0) {
            newClickList.push([row, col]);
        } else if (clickList.length == 1) {
            if (checkSelected(clickList, row, col)) {
                return;
            }
            newClickList.push([row, col]);
        }
        setClickList(newClickList);
    }
    const handleStartGame = () => {
        timerRef.current = setInterval(() => {
            setTime(time => time + 1);
        }, 1000)
        setRemainder(BOARD_SIZE * BOARD_SIZE / 2);
        setBoard(generateBoard());
        setGameStatus(GAME_STATUS.RUNNING)
    }

    useEffect(() => {
        // 当点击列表长度为2时，进行游戏逻辑判断
        if (clickList.length == 2) {
            const newClickList = _.cloneDeep(clickList);
            // 检查是否连接成功
            if (checkConnect(board, clickList)) {
                setRemainder(remainder - 1);
                // 连接成功，清除图案
                const newBoard = _.cloneDeep(board);
                newBoard[clickList[0][0]][clickList[0][1]] = 0;
                newBoard[clickList[1][0]][clickList[1][1]] = 0;
                setBoard(newBoard);
            }
            // 清除点击列表
            newClickList.pop();
            newClickList.pop();
            setClickList(newClickList);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clickList])
    useEffect(() => {
        if (gameStatus == GAME_STATUS.HOME)
            return;
        if (checkGameOver((board))) {
            if(remainder == 0){
                setRankList([...rankList, time])
                localStorage.setItem('connectRankList',JSON.stringify(rankList))
            }
            setGameStatus(GAME_STATUS.GAME_OVER)
            clearInterval(timerRef.current)
            setTime(0)
            setRemainder(0)
            console.log("游戏结束")
        }
        // 检查全局是否存在可连接图案
        else if (!checkGlobalConnect(board)) {
            setBoard(shuffleBoard(board));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [board])
    const renderHtmlByStatus = (gameStatus: number): ReactNode => {
        switch (gameStatus) {
            case GAME_STATUS.HOME:
                return (
                    <div>
                        <button onClick={handleStartGame} className='start-btn'>开始游戏</button>
                    </div>
                )
            case GAME_STATUS.RUNNING:
                return (
                    <div>
                        <p className='time'>{formatTime(time)}</p>
                        <p className='remainder'>剩余： {remainder} </p>
                        <button onClick={() => setBoard(reBoxArray(BOARD_SIZE))} className='again-btn'>结束游戏</button>
                        <button onClick={()=>{setBoard(shuffleBoard(board));setTime(time+30)}} className='again-btn'> 洗牌</button>
                    </div>
                )
            case GAME_STATUS.GAME_OVER:
                return (
                    <div>
                        <button onClick={handleStartGame} className='again-btn'>再来一局</button>
                        <button onClick={() => setGameStatus(GAME_STATUS.HOME)} className='back-btn'>返回首页</button>
                    </div>
                )
        }
    }
    const renderRankList = () => {
        const newList = _.cloneDeep(rankList);
        newList.sort((a, b) => a - b);
        return (
            <>
                <h1>排行榜</h1>
                <div className='rank-list'>
                    <div className='rank-list-header'>
                        <span className='rank'>排名</span>
                        <span className='time'>时间</span>
                    </div>
                    {newList.map((item,index)=>(
                        <div key={index}>
                            <span className='rank'>{index+1}</span>
                            <span className='time'>{formatTime(item)}</span>
                        </div>
                    ))}
                </div>
            </>
        )
    }
    return (
        <div className='connect'>
            <div className='board'>
                {gameStatus != GAME_STATUS.HOME ? board.map((row, i) => (
                    <div key={i} className='board-row'>
                        {row.map((col, j) => (
                            <div style={{backgroundColor:patterns[col].color}} key={j} onClick={() => handleClickItem(i, j)} className={"board-col  " + (checkSelected(clickList, i, j) ? "selected" : "")}>{col ? patterns[col].pattern : null}</div>
                        ))}
                    </div>
                )) :renderRankList()}
            </div>
            <div className="control">
                <h1>{gameStatus == GAME_STATUS.HOME ? "首页" : gameStatus == GAME_STATUS.RUNNING ? "游戏进行中" : "游戏结束"}</h1>
                {renderHtmlByStatus(gameStatus)}
            </div>
        </div>
    )
}
