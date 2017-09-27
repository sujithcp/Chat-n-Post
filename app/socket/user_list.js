userList = null

function UserList(){
	this.setUserList = function(list){
		userList = list;
	}
	this.getUserList = function(list){
		return userList;
	}
}
module.exports = new UserList();