import { useState } from 'react';

export const useModals = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingInterval, setEditingInterval] = useState(null);
  const [intervalToDelete, setIntervalToDelete] = useState(null);
  const [categoryModalConfig, setCategoryModalConfig] = useState({
    onSave: null,
    addNewOnOpen: false,
    directAdd: false,
    autoCloseOnSave: true
  });

  // New state for EditCategoryModal
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  const openEditModal = (interval, index) => {
    setEditingInterval(index !== undefined ? { ...interval, index } : interval);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingInterval(null);
    setIsEditModalOpen(false);
  };

  const openDeleteModal = (index) => {
    setIntervalToDelete(index);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIntervalToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const openCategoryModal = (onSave, addNewOnOpen = false, directAdd = false, autoCloseOnSave = true) => {
    setCategoryModalConfig({ onSave, addNewOnOpen, directAdd, autoCloseOnSave });
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setCategoryModalConfig({
      onSave: null,
      addNewOnOpen: false,
      directAdd: false,
      autoCloseOnSave: true
    });
  };

  // Functions to handle EditCategoryModal
  const openEditCategoryModal = (category) => {
    console.log('Opening Edit Category Modal with category:', category);
    setCategoryToEdit(category);
    setIsEditCategoryModalOpen(true);
  };

  const closeEditCategoryModal = () => {
    console.log('Closing Edit Category Modal');
    setCategoryToEdit(null);
    setIsEditCategoryModalOpen(false);
  };

  return {
    isEditModalOpen,
    isDeleteModalOpen,
    isCategoryModalOpen,
    editingInterval,
    intervalToDelete,
    categoryModalConfig,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    openCategoryModal,
    closeCategoryModal,
    setEditingInterval,
    // New modal states and functions
    isEditCategoryModalOpen,
    categoryToEdit,
    openEditCategoryModal,
    closeEditCategoryModal
  };
};
