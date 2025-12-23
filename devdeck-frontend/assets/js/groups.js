// Gerenciamento de Groups e Tasks de Grupo
let allGroups = [];
let currentGroupId = null;

// Carregar grupos
async function loadGroups() {
    try {
        const groups = await DevDeck.fetchApi('/groups');
        allGroups = groups || [];
        return groups;
    } catch (error) {
        console.error('Erro ao carregar grupos:', error);
        return [];
    }
}

// Obter detalhes de um grupo
async function getGroupDetails(groupId) {
    try {
        const group = await DevDeck.fetchApi(`/groups/${groupId}`);
        return group;
    } catch (error) {
        console.error('Erro ao obter detalhes do grupo:', error);
        return null;
    }
}

// Criar um novo grupo
async function createGroup(name, description) {
    try {
        const group = await DevDeck.fetchApi('/groups', {
            method: 'POST',
            body: JSON.stringify({ name, description })
        });
        return group;
    } catch (error) {
        console.error('Erro ao criar grupo:', error);
        throw error;
    }
}

// Atualizar um grupo
async function updateGroup(groupId, name, description) {
    try {
        const group = await DevDeck.fetchApi(`/groups/${groupId}`, {
            method: 'PATCH',
            body: JSON.stringify({ name, description })
        });
        return group;
    } catch (error) {
        console.error('Erro ao atualizar grupo:', error);
        throw error;
    }
}

// Deletar um grupo
async function deleteGroup(groupId) {
    try {
        await DevDeck.fetchApi(`/groups/${groupId}`, {
            method: 'DELETE'
        });
        return true;
    } catch (error) {
        console.error('Erro ao deletar grupo:', error);
        throw error;
    }
}

// Convidar membro para grupo
async function inviteGroupMember(groupId, email, role = 'member') {
    try {
        const result = await DevDeck.fetchApi(`/groups/${groupId}/invite`, {
            method: 'POST',
            body: JSON.stringify({ email, role })
        });
        return result;
    } catch (error) {
        console.error('Erro ao convidar membro:', error);
        throw error;
    }
}

// Obter membros de um grupo
async function getGroupMembers(groupId) {
    try {
        const members = await DevDeck.fetchApi(`/groups/${groupId}/members`);
        return members;
    } catch (error) {
        console.error('Erro ao obter membros do grupo:', error);
        return [];
    }
}

// Remover membro de um grupo
async function removeGroupMember(groupId, memberId) {
    try {
        await DevDeck.fetchApi(`/groups/${groupId}/members/${memberId}`, {
            method: 'DELETE'
        });
        return true;
    } catch (error) {
        console.error('Erro ao remover membro:', error);
        throw error;
    }
}

// Carregar tasks de um board de grupo
async function loadGroupBoardTasks(boardId) {
    try {
        const tasks = await DevDeck.fetchApi(`/tasks?boardId=${boardId}`);
        return tasks || [];
    } catch (error) {
        console.error('Erro ao carregar tasks do board do grupo:', error);
        return [];
    }
}

// Criar task em um board de grupo
async function createGroupBoardTask(boardId, title, description, status = 'TODO') {
    try {
        const task = await DevDeck.fetchApi('/tasks', {
            method: 'POST',
            body: JSON.stringify({
                title,
                description,
                status,
                boardId
            })
        });
        return task;
    } catch (error) {
        console.error('Erro ao criar task:', error);
        throw error;
    }
}

// Atualizar task de um board de grupo
async function updateGroupBoardTask(taskId, title, description, status, boardId) {
    try {
        const task = await DevDeck.fetchApi(`/tasks/${taskId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                title,
                description,
                status,
                boardId
            })
        });
        return task;
    } catch (error) {
        console.error('Erro ao atualizar task:', error);
        throw error;
    }
}

// Deletar task de um board de grupo
async function deleteGroupBoardTask(taskId) {
    try {
        await DevDeck.fetchApi(`/tasks/${taskId}`, {
            method: 'DELETE'
        });
        return true;
    } catch (error) {
        console.error('Erro ao deletar task:', error);
        throw error;
    }
}

// Função para renderizar boards de grupo em um dropdown ou lista
function renderGroupBoards(groupId, container) {
    const group = allGroups.find(g => g.id === groupId);
    
    if (!group) {
        console.error('Grupo não encontrado:', groupId);
        return;
    }
    
    if (!group.boards || group.boards.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-sm p-2">Nenhum board neste grupo</p>';
        return;
    }
    
    container.innerHTML = '';
    group.boards.forEach(board => {
        const option = document.createElement('option');
        option.value = board.id;
        option.textContent = board.name;
        container.appendChild(option);
    });
}

// Expor funções globalmente
window.loadGroups = loadGroups;
window.getGroupDetails = getGroupDetails;
window.createGroup = createGroup;
window.updateGroup = updateGroup;
window.deleteGroup = deleteGroup;
window.inviteGroupMember = inviteGroupMember;
window.getGroupMembers = getGroupMembers;
window.removeGroupMember = removeGroupMember;
window.loadGroupBoardTasks = loadGroupBoardTasks;
window.createGroupBoardTask = createGroupBoardTask;
window.updateGroupBoardTask = updateGroupBoardTask;
window.deleteGroupBoardTask = deleteGroupBoardTask;
window.renderGroupBoards = renderGroupBoards;
