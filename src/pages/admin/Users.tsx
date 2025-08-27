import { useState, useCallback, useEffect } from 'react';
import { registerUser, getUsers, updateUser, type RegisterRequest, type User } from '@/api/auth';
import { getPlants, type Plant } from '@/api/plants';
import { toastError, toastSuccess } from '@/utils/toast';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import Spinner from '@/components/common/Spinner';
import { Modal } from '@/components/common/Modal';
import { formatDate } from '@/utils/date';
import { Edit, Plus, Users as UsersIcon, Search } from 'lucide-react';

interface FormData {
  username: string;
  password: string;
  confirmPassword: string;
  name: string;
  empId: string;
  role: 'admin' | 'supervisor' | 'operator';
  plantId: string;
}

interface FormErrors {
  username?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  empId?: string;
  role?: string;
  plantId?: string;
}

interface UpdateFormData {
  role: 'admin' | 'supervisor' | 'operator';
  plantId: string;
  isActive: boolean;
}

const Users = () => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    empId: '',
    role: 'operator',
    plantId: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [plantsLoading, setPlantsLoading] = useState(true);

  // User list state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Modal state
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Update form state
  const [updateFormData, setUpdateFormData] = useState<UpdateFormData>({
    role: 'operator',
    plantId: '',
    isActive: true,
  });

  // Fetch plants for dropdown
  const fetchPlants = useCallback(async () => {
    try {
      setPlantsLoading(true);
      const plantsData = await getPlants({ isActive: true });
      setPlants(plantsData);
    } catch (error) {
      console.error('Error fetching plants:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status !== 401) {
          toastError('Failed to load plants');
        }
      } else {
        toastError('Failed to load plants');
      }
    } finally {
      setPlantsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status !== 401) {
          toastError('Failed to load users');
        }
      } else {
        toastError('Failed to load users');
      }
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.empId.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchQuery]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    // Employee ID validation
    if (!formData.empId.trim()) {
      newErrors.empId = 'Employee ID is required';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    // Plant validation (optional for admin role)
    if (formData.role !== 'admin' && !formData.plantId) {
      newErrors.plantId = 'Plant is required for supervisor and operator roles';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const payload: RegisterRequest = {
        username: formData.username.trim(),
        password: formData.password,
        name: formData.name.trim(),
        empId: formData.empId.trim(),
        role: formData.role,
        ...(formData.plantId && { plantId: formData.plantId }),
      };

      const response = await registerUser(payload);

      toastSuccess(`User "${response.user.name}" registered successfully`);

      // Reset form and close modal
      resetForm();
      setShowRegistrationModal(false);
      fetchUsers();
    } catch (error: unknown) {
      console.error('Registration error:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: { message?: string; errors?: Array<{ path?: string; message: string }> };
          };
        };

        if (axiosError.response?.data?.message) {
          toastError(axiosError.response.data.message);
        } else if (axiosError.response?.data?.errors) {
          const backendErrors = axiosError.response.data.errors;
          const fieldErrors: FormErrors = {};

          backendErrors.forEach((err) => {
            if (err.path) {
              fieldErrors[err.path as keyof FormErrors] = err.message;
            }
          });

          setErrors(fieldErrors);
          toastError('Please fix the errors in the form');
        } else {
          toastError('Failed to register user. Please try again.');
        }
      } else {
        toastError('Failed to register user. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle update form submission
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingUser) return;

    try {
      setLoading(true);

      const payload = {
        role: updateFormData.role,
        plantId: updateFormData.plantId || null,
        isActive: updateFormData.isActive,
      };

      await updateUser(editingUser._id, payload);

      toastSuccess(`User "${editingUser.name}" updated successfully`);

      setShowUpdateModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: unknown) {
      console.error('Update error:', error);
      toastError('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle update form changes
  const handleUpdateInputChange = (field: keyof UpdateFormData, value: string | boolean) => {
    setUpdateFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle role change
  const handleRoleChange = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      role: role as 'admin' | 'supervisor' | 'operator',
      ...(role === 'admin' && { plantId: '' }),
    }));

    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: undefined }));
    }
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUpdateFormData({
      role: user.role,
      plantId: user.plantId?._id || '',
      isActive: user.isActive,
    });
    setShowUpdateModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      name: '',
      empId: '',
      role: 'operator',
      plantId: '',
    });
    setErrors({});
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'supervisor':
        return 'bg-blue-100 text-blue-800';
      case 'operator':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" />

      {/* User List */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5" />
            <h2 className="text-lg font-semibold">System Users</h2>
          </div>
          <Button onClick={() => setShowRegistrationModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search users by name, username, or employee ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Users Table */}
        {usersLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      {searchQuery ? 'No users found matching your search' : 'No users found'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.empId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}
                        >
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.plantId ? `${user.plantId.name} ` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Registration Modal */}
      <Modal
        open={showRegistrationModal}
        onClose={() => {
          setShowRegistrationModal(false);
          resetForm();
        }}
        title="Register New User"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <FormField label="Username" htmlFor="username" required error={errors.username}>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Enter username"
              disabled={loading}
            />
          </FormField>

          {/* Password */}
          <FormField label="Password" htmlFor="password" required error={errors.password}>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter password"
              disabled={loading}
            />
          </FormField>

          {/* Confirm Password */}
          <FormField
            label="Confirm Password"
            htmlFor="confirmPassword"
            required
            error={errors.confirmPassword}
          >
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirm password"
              disabled={loading}
            />
          </FormField>

          {/* Full Name */}
          <FormField label="Full Name" htmlFor="name" required error={errors.name}>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter full name"
              disabled={loading}
            />
          </FormField>

          {/* Employee ID */}
          <FormField label="Employee ID" htmlFor="empId" required error={errors.empId}>
            <Input
              id="empId"
              type="text"
              value={formData.empId}
              onChange={(e) => handleInputChange('empId', e.target.value)}
              placeholder="Enter employee ID"
              disabled={loading}
            />
          </FormField>

          {/* Role */}
          <FormField label="Role" htmlFor="role" required error={errors.role}>
            <Select
              id="role"
              value={formData.role}
              onChange={(e) => handleRoleChange(e.target.value)}
              disabled={loading}
            >
              <option value="operator">Operator</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Admin</option>
            </Select>
          </FormField>

          {/* Plant (conditional) */}
          {formData.role !== 'admin' && (
            <FormField
              label="Plant"
              htmlFor="plantId"
              required
              error={errors.plantId}
              hint="Plant assignment is required for supervisor and operator roles"
            >
              <Select
                id="plantId"
                value={formData.plantId}
                onChange={(e) => handleInputChange('plantId', e.target.value)}
                disabled={loading || plantsLoading}
              >
                <option value="">Select a plant</option>
                {plants.map((plant) => (
                  <option key={plant._id} value={plant._id}>
                    {plant.name} ({plant.code})
                  </option>
                ))}
              </Select>
              {plantsLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Spinner />
                  Loading plants...
                </div>
              )}
              {!plantsLoading && plants.length === 0 && (
                <div className="text-sm text-red-500">
                  No plants available. Please create plants first.
                </div>
              )}
            </FormField>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowRegistrationModal(false);
                resetForm();
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || plantsLoading} className="min-w-[120px]">
              {loading ? (
                <>
                  <Spinner />
                  Registering...
                </>
              ) : (
                'Register User'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Update User Modal */}
      <Modal
        open={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setEditingUser(null);
        }}
        title="Update User"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-6">
          {/* Role */}
          <FormField label="Role" htmlFor="updateRole" required>
            <Select
              id="updateRole"
              value={updateFormData.role}
              onChange={(e) =>
                handleUpdateInputChange(
                  'role',
                  e.target.value as 'admin' | 'supervisor' | 'operator',
                )
              }
              disabled={loading}
            >
              <option value="operator">Operator</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Admin</option>
            </Select>
          </FormField>

          {/* Plant */}
          <FormField label="Plant" htmlFor="updatePlantId" hint="Leave empty for admin role">
            <Select
              id="updatePlantId"
              value={updateFormData.plantId}
              onChange={(e) => handleUpdateInputChange('plantId', e.target.value)}
              disabled={loading || plantsLoading}
            >
              <option value="">Select a plant</option>
              {plants.map((plant) => (
                <option key={plant._id} value={plant._id}>
                  {plant.name} ({plant.code})
                </option>
              ))}
            </Select>
          </FormField>

          {/* Status */}
          <FormField label="Status" htmlFor="updateStatus">
            <Select
              id="updateStatus"
              value={updateFormData.isActive ? 'true' : 'false'}
              onChange={(e) => handleUpdateInputChange('isActive', e.target.value === 'true')}
              disabled={loading}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
          </FormField>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowUpdateModal(false);
                setEditingUser(null);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? (
                <>
                  <Spinner />
                  Updating...
                </>
              ) : (
                'Update User'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
