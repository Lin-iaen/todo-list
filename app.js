document.addEventListener('DOMContentLoaded', () => {

    // 1. 获取 HTML 元素
    const taskInput = document.getElementById('task-input');
    const deadlineInput = document.getElementById('deadline-input'); // (新)
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');

    // (新!) 我们的“数据源”
    // 这是一个任务对象的数组
    // [ {id: 1, text: "写报告", deadline: "2025-10-20"}, ... ]
    let tasks = [];

    // 2. 绑定事件
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    // 3. (新) “添加任务”函数 (重写)
    function addTask() {
        const taskText = taskInput.value.trim();
        const deadlineValue = deadlineInput.value; // (新) "YYYY-MM-DD" 格式

        // 验证输入
        if (taskText === '') {
            alert('请输入任务内容！');
            return;
        }
        if (deadlineValue === '') { // (新)
            alert('请设置截止日期！');
            return;
        }

        // (新) 创建一个任务对象
        const newTask = {
            id: Date.now(), // 用当前时间戳作为唯一 ID
            text: taskText,
            deadline: deadlineValue 
        };

        // (新) 把新任务添加到数组中
        tasks.push(newTask);

        // (新!) 核心功能：按照截止日期(deadline)给 tasks 数组排序
        tasks.sort((a, b) => {
            // 这和 C++ 的 sort 比较函数很像
            if (a.deadline < b.deadline) {
                return -1; // a 排在 b 前面
            }
            if (a.deadline > b.deadline) {
                return 1; // a 排在 b 后面
            }
            return 0; // 相等
        });
        
        // (新) 根据排序后的数组，重新渲染整个列表
        renderTasks();

        // 清空输入框
        taskInput.value = '';
        deadlineInput.value = '';
    }

    // 4. (新) “渲染列表”函数
    function renderTasks() {
        // 先清空当前的列表
        taskList.innerHTML = ''; 

        // 遍历排序后的 tasks 数组
        tasks.forEach(task => {
            // 创建一个新的 <li> 元素
            const li = document.createElement('li');
            
            // (新) 格式化日期
            const formattedDeadline = formatDeadline(task.deadline);

            // 设置 <li> 里的内容
            li.innerHTML = `
                <span class="task-content">
                    ${task.text} 
                    <small>截止日期: ${formattedDeadline}</small> 
                </span>
                <button class="delete-btn">删除</button>
            `;

            // 把这个 <li> 添加到 <ul> 列表中
            taskList.appendChild(li);

            // --- 给“删除”按钮加上功能 ---
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                // (新) 不是直接删除 li，而是从数组中删除数据
                tasks = tasks.filter(t => t.id !== task.id);
                
                // (新) 再次重新渲染，排序保持不变
                renderTasks(); 
            });
        });
    }

    // 5. (新) 辅助函数：格式化日期
    // 输入: "2025-10-25" (字符串)
    // 输出: "10月25日 星期六" (字符串)
    function formatDeadline(dateString) {
        // JS Date对象有个时区陷阱，直接 new Date("YYYY-MM-DD") 会解析为UTC零点
        // 导致在东八区显示时可能是前一天。
        // 最安全的做法是手动拆分字符串来创建日期对象
        const parts = dateString.split('-'); // 得到 ["2025", "10", "25"]
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // 月份是从 0 开始的 (10月 -> 9)
        const day = parseInt(parts[2], 10);

        const dateObj = new Date(year, month, day);

        const dateStr = `${month + 1}月${day}日`;
        const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const dayStr = days[dateObj.getDay()];

        return `${dateStr} ${dayStr}`;
    }
    if ('serviceWorker' in navigator) {
  // 我们在 'load' 事件后注册，以免阻塞页面加载
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker 注册成功，范围: ', registration.scope);
      })
      .catch(err => {
        console.log('ServiceWorker 注册失败: ', err);
      });
  });
}

});