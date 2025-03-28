document.addEventListener("DOMContentLoaded", () => {

    const taskForm = document.getElementById("task-form")
    const taskList = document.getElementById("task-list")
    const taskTemplate = document.getElementById("task-template")
    const submitBtn = document.getElementById("submit-btn")
    const updateBtn = document.getElementById("update-btn")
    const cancelBtn = document.getElementById("cancel-btn")
    const filterOptions = document.querySelectorAll(".filter-option")

    const taskTitleInput = document.getElementById("task-title")
    const taskDescriptionInput = document.getElementById("task-description")
    const taskPriorityInput = document.getElementById("task-priority")
    const taskDateInput = document.getElementById("task-date")

    let tasks = JSON.parse(localStorage.getItem("tasks")) || []
    let currentTaskId = null
    let currentFilter = "all"

    renderTasks()

    taskForm.addEventListener("submit", handleFormSubmit)
    updateBtn.addEventListener("click", handleUpdateTask)
    cancelBtn.addEventListener("click", resetForm)

    // Sistema de filtrado de tareas por prioridad (alta, media, baja)
    filterOptions.forEach((option) => {
      option.addEventListener("click", function (e) {
        e.preventDefault()
        currentFilter = this.dataset.filter
        renderTasks()

        document.getElementById("filterDropdown").textContent = this.textContent === "All" ? "Filter" : this.textContent
      })
    })

    function handleFormSubmit(e) {
      e.preventDefault()

      const newTask = {
        id: Date.now().toString(),
        title: taskTitleInput.value.trim(),
        description: taskDescriptionInput.value.trim(),
        priority: taskPriorityInput.value,
        date: taskDateInput.value || formatDate(new Date()),
        createdAt: new Date().toISOString(),
      }
  
      tasks.push(newTask)
      saveTasks()
      renderTasks()
      resetForm()
    }
  
    function handleUpdateTask() {
      const taskIndex = tasks.findIndex((task) => task.id === currentTaskId)
  
      if (taskIndex !== -1) {
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          title: taskTitleInput.value.trim(),
          description: taskDescriptionInput.value.trim(),
          priority: taskPriorityInput.value,
          date: taskDateInput.value || tasks[taskIndex].date,
        }
  
        saveTasks()
        renderTasks()
        resetForm()
      }
    }


    // Funcion para editar tarea
    function editTask(taskId) {
      const task = tasks.find((task) => task.id === taskId)
  
      if (task) {
        currentTaskId = taskId
  
        taskTitleInput.value = task.title
        taskDescriptionInput.value = task.description
        taskPriorityInput.value = task.priority
        taskDateInput.value = task.date
  
        submitBtn.classList.add("d-none")
        updateBtn.classList.remove("d-none")
        cancelBtn.classList.remove("d-none")

        taskForm.scrollIntoView({ behavior: "smooth" })
      }
    }
  
    function deleteTask(taskId) {
      if (confirm("Are you sure you want to delete this task?")) {
        tasks = tasks.filter((task) => task.id !== taskId)
        saveTasks()
        renderTasks()
  
        if (currentTaskId === taskId) {
          resetForm()
        }
      }
    }
  
    function resetForm() {
      taskForm.reset()
      currentTaskId = null
      submitBtn.classList.remove("d-none")
      updateBtn.classList.add("d-none")
      cancelBtn.classList.add("d-none")
    }
  
    function renderTasks() {

      taskList.innerHTML = ""

      let filteredTasks = tasks
      if (currentFilter !== "all") {
        filteredTasks = tasks.filter((task) => task.priority === currentFilter)
      }
 
      filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  
      if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement("li")
        emptyMessage.className = "list-group-item text-center text-muted"
        emptyMessage.textContent =
          currentFilter === "all"
            ? "No tasks yet. Add a task to get started!"
            : `No ${currentFilter} priority tasks found.`
        taskList.appendChild(emptyMessage)
        return
      }

      filteredTasks.forEach((task) => {
        const taskElement = document.importNode(taskTemplate.content, true).querySelector(".task-item")

        taskElement.dataset.id = task.id
        taskElement.dataset.priority = task.priority

        taskElement.querySelector(".task-title").textContent = task.title
        taskElement.querySelector(".task-description").textContent = task.description || "No description"
  
        const priorityBadge = taskElement.querySelector(".task-priority")
        priorityBadge.textContent = capitalizeFirstLetter(task.priority)
        priorityBadge.classList.add(task.priority)
  
        taskElement.querySelector(".task-date").textContent = formatDateForDisplay(task.date)

        taskElement.querySelector(".edit-btn").addEventListener("click", () => editTask(task.id))
        taskElement.querySelector(".delete-btn").addEventListener("click", () => deleteTask(task.id))
  
        taskList.appendChild(taskElement)
      })
    }
  
    function saveTasks() {
      localStorage.setItem("tasks", JSON.stringify(tasks))
    }

    function formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }
  
    function formatDateForDisplay(dateString) {
      if (!dateString) return "No due date"
  
      const date = new Date(dateString)
      const options = { year: "numeric", month: "short", day: "numeric" }
      return date.toLocaleDateString(undefined, options)
    }
  
    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1)
    }
  })
  
  