import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import AdminMenu from '../../components/AdminMenu';
import axios from 'axios';
import moment from 'moment';
import { useAuth } from '../../context/auth';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [auth] = useAuth();

  const getAllUsers = async () => {
    try {
      const { data } = await axios.get('/api/v1/auth/all-users');
      setUsers(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (auth?.token) getAllUsers();
  }, [auth?.token]);

  return (
    <Layout title={"Dashboard - All Users"}>
      <div className="container-fluid m-3 p-3">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <h1 className="text-center mb-4">All Users</h1>
            {users?.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead className="thead-dark">
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">Phone</th>
                      <th scope="col">Address</th>
                      <th scope="col">Role</th>
                      <th scope="col">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user._id}>
                        <td>{index + 1}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>{user.address}</td>
                        <td>{user.role === 1 ? 'Admin' : 'User'}</td>
                        <td>{moment(user.createdAt).format('DD/MM/YYYY')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center">No users found</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Users;