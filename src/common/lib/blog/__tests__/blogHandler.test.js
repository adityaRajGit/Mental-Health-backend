import * as blogHandler from '../blogHandler';
import blogHelper from '../../../helpers/blog.helper.js';

jest.mock('../../../helpers/blog.helper.js');

describe('blogHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addNewBlogHandler', () => {
    it('should add a new blog and return the blog object', async () => {
      const mockInput = { title: 'Test Blog', content: 'Blog content' };
      const mockBlog = { ...mockInput, _id: 'mockid123' };
      blogHelper.addObject.mockResolvedValue(mockBlog);
      const result = await blogHandler.addNewBlogHandler(mockInput);
      expect(blogHelper.addObject).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockBlog);
    });
  });

  describe('getBlogDetailsHandler', () => {
    it('should get blog details by id', async () => {
      const mockInput = { id: 'blog123' };
      const mockBlog = { _id: 'blog123', title: 'Test Blog' };
      blogHelper.getObjectById.mockResolvedValue(mockBlog);
      const result = await blogHandler.getBlogDetailsHandler(mockInput);
      expect(blogHelper.getObjectById).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockBlog);
    });
  });

  describe('updateBlogDetailsHandler', () => {
    it('should update blog details', async () => {
      const mockInput = { objectId: 'blog123', updateObject: { title: 'Updated Blog' } };
      const mockUpdated = { _id: 'blog123', title: 'Updated Blog' };
      blogHelper.directUpdateObject.mockResolvedValue(mockUpdated);
      const result = await blogHandler.updateBlogDetailsHandler(mockInput);
      expect(blogHelper.directUpdateObject).toHaveBeenCalledWith('blog123', { title: 'Updated Blog' });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('getBlogListHandler', () => {
    it('should return blog list and count', async () => {
      const mockInput = { query: {} };
      const mockList = [{ _id: 'blog1' }, { _id: 'blog2' }];
      const mockCount = 2;
      blogHelper.getAllObjects.mockResolvedValue(mockList);
      blogHelper.getAllObjectCount.mockResolvedValue(mockCount);
      const result = await blogHandler.getBlogListHandler(mockInput);
      expect(result).toEqual({ list: mockList, count: mockCount });
    });
  });

  describe('deleteBlogHandler', () => {
    it('should delete blog by id', async () => {
      const mockInput = 'blog123';
      const mockDeleted = { deleted: true };
      blogHelper.deleteObjectById.mockResolvedValue(mockDeleted);
      const result = await blogHandler.deleteBlogHandler(mockInput);
      expect(blogHelper.deleteObjectById).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockDeleted);
    });
  });
});
