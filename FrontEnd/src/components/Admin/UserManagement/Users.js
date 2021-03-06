import React, { Component, Fragment } from 'react'
import Modal from 'react-bootstrap/Modal';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator'
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor'

import apis from '../../../services/apis';

import CreateUser from './CreateUser'
import InputPassword from './InputPassword'
import { toast } from 'react-toastify';


export default class Users extends Component {

    state = {
        username: '',
        users: [],
        showDelete: false,
    }

    async componentDidMount() {
        this.getUsers()
    }

    getUsers = async () => {
        let users = []

        try {
            let answer = await apis.User.getUsers()
            answer.forEach((user) => {
                users.push({
                    ...user,
                    password: ''
                })
            })
        } catch (error) {
            toast.error(error.statusText)
        }

        this.setState({
            users: users,
        })
    }

    resetState = () => {
        this.setState({
            showDelete: false
        })
        this.getUsers()
    }

    modify = async (row) => {

        let password = row.password == null ? null : row.password

        await apis.User.modifyUser(
            row.username,
            row.firstname,
            row.lastname,
            row.email,
            row.role,
            password,
            row.superAdmin
        ).then(() => {
            toast.success('User modified')
            this.resetState()
        }).catch((error) => toast.error(error.statusText))
    }

    delete = () => {
        if (this.state.userId !== '') {

            apis.User.deleteUser(this.state.username).then(() => {
                toast.success('Deleted User')
                this.resetState()
            }).catch((error) => { toast.error(error.statusText) })
        }
    }

    column = [
        {
            dataField: 'id',
            hidden: true
        }, {
            dataField: 'username',
            text: 'Username',
            sort: true,
            editable: true
        }, {
            dataField: 'firstname',
            text: 'First name',
            sort: true
        }, {
            dataField: 'lastname',
            text: 'Last name',
            sort: true
        }, {
            dataField: 'email',
            text: 'E-Mail',
            sort: true
        }, {
            dataField: 'role',
            text: 'Role',
            sort: true,
            editor: {
                type: Type.SELECT,
                getOptions: (setOptions, { row, column }) => {
                    apis.role.getRoles().then(roles => {
                        let options = []
                        roles.forEach((role) => {
                            options.push({
                                value: role.name,
                                label: role.name
                            })
                        })
                        setOptions(options)
                    })
                }
            }
        }, {
            dataField: 'password',
            text: 'New Password',
            style: {
                'fontSize': '0px'
            },
            editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => (
                <InputPassword {...editorProps} previousPassword={value} />
            )
        }, {
            dataField: 'superAdmin',
            text: 'Super Admin',
            type : 'bool',
            editor: {
                type: Type.SELECT,
                options: [{
                  value: true,
                  label: 'Yes'
                }, {
                  value: false,
                  label: 'No'
                }]
            },
            formatter: (cell, row, index) => {
                return cell ===true ? 'Yes' : 'No'
            }
        }, {
            dataField: 'edit',
            text: 'Edit',
            editable: false,
            formatter: (cell, row, index) => {
                return <button type='button' name='edit' className='btn btn-warning' onClick={() => {
                    this.modify(row)
                }} >Save</button>
            }
        }, {
            dataField: 'delete',
            text: 'Delete',
            editable: false,
            formatter: (cell, row, index) => {
                return <button type='button' name='delete' className='btn btn-danger' onClick={(event) => {
                    this.setState({ username: row.username, userId : row.id, showDelete: true })
                }} >Delete</button>
            }
        }
    ]

    render = () => {
        return (
            <Fragment>
                <div>
                    <h2 className='card-title'>Local Users</h2>
                    <CreateUser getUsers={this.getUsers} />
                    <BootstrapTable
                        keyField='id'
                        data={this.state.users}
                        columns={this.column}
                        striped
                        pagination={paginationFactory()}
                        wrapperClasses="table-responsive"
                        cellEdit={cellEditFactory({
                            blurToSave: true,
                            autoSelectText: true,
                            mode: 'click'
                        })}
                    />
                </div>
                <Modal id='delete' show={this.state.showDelete} onHide={this.resetState} size='sm'>
                    <Modal.Header closeButton>
                        <h2 className='card-title'>Delete User</h2>
                    </Modal.Header>
                    <Modal.Body>
                        Are You sure to delete {this.state.username} ?
                    </Modal.Body>
                    <Modal.Footer>
                        <button type='button' className='btn btn-danger' onClick={this.delete}>Delete</button>
                        <button type='button' className='btn btn-info' onClick={() => this.setState({ showDelete: false })}>Close</button>
                    </Modal.Footer>
                </Modal>

            </Fragment>

        );
    }
}