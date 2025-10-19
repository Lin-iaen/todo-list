document.addEventListener('DOMContentLoaded', () => {

    // 1. 获取 HTML 元素
    const taskInput = document.getElementById('task-input');
    const deadlineInput = document.getElementById('deadline-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');

    // 我们的“数据源”，从 localStorage 加载
    let tasks = [];
    const STORAGE_KEY = 'myDDLTasks'; // 定义一个唯一的 key

    // 函数：保存任务到 localStorage
    function saveTasks() {
        // localStorage 只能存字符串，所以用 JSON.stringify 转换
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    // 函数：从 localStorage 加载任务
    function loadTasks() {
        const savedTasks = localStorage.getItem(STORAGE_KEY);
        if (savedTasks) {
            // 把字符串转回数组对象
            tasks = JSON.parse(savedTasks);
        }
    }

    // “添加任务”函数
    function addTask() {
        const taskText = taskInput.value.trim();
        const deadlineValue = deadlineInput.value;

        if (taskText === '' || deadlineValue === '') {
            alert('请输入任务内容和截止日期！');
            return;
        }

        const newTask = {
            id: Date.now(),
            text: taskText,
            deadline: deadlineValue
        };

        tasks.push(newTask);
        
        // 排序
        tasks.sort((a, b) => (a.deadline < b.deadline) ? -1 : 1);
        
        // 保存数据
        saveTasks();
        
        // 渲染
        renderTasks();

        taskInput.value = '';
        deadlineInput.value = '';
    }

    // “渲染列表”函数
    function renderTasks() {
        taskList.innerHTML = ''; 

        tasks.forEach(task => {
            const li = document.createElement('li');
            const formattedDeadline = formatDeadline(task.deadline);

            li.innerHTML = `
                <span class="task-content">
                    ${task.text} 
                    <small>截止日期: ${formattedDeadline}</small> 
                </span>
                <button class="delete-btn">删除</button>
            `;

            taskList.appendChild(li);

            // 删除按钮的事件
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                // 从数组中删除
                tasks = tasks.filter(t => t.id !== task.id);
                
                // 保存更改
                saveTasks();

                // 重新渲染
                renderTasks(); 
            });
        });
    }

    // 辅助函数：格式化日期
    function formatDeadline(dateString) {
        // 使用 new Date(dateString + 'T00:00:00') 来确保按本地时区解析
        // 避免 YYYY-MM-DD 被当做 UTC 解析导致的时区错误
        const dateObj = new Date(dateString + 'T00:00:00');

        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        
        const dateStr = `${month}月${day}日`;
        const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const dayStr = days[dateObj.getDay()];
        return `${dateStr} ${dayStr}`;
    }

    // --- 页面加载时的启动逻辑 ---
    
    // 1. 先加载数据
    loadTasks();
    // 2. 立即渲染已加载的数据
    renderTasks();

    // 3. 绑定“添加”按钮事件
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });

});


// --- PWA Service Worker 注册 ---
// (放在所有代码的最后)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    
    // (重要!) 使用相对路径 'sw.js'，而不是 '/sw.js'
    navigator.serviceWorker.register('sw.js') 
      .then(registration => {
        console.log('ServiceWorker 注册成功，范围: ', registration.scope);
      })
      .catch(err => {
        console.log('ServiceWorker 注册失败: ', err);
      });
  });
}