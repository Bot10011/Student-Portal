import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  TextField,
} from '@mui/material';
import { toast } from 'react-hot-toast';

interface Student {
  id: string;
  name: string;
  studentType: 'Freshman' | 'Regular' | 'Irregular' | 'Transferee';
  yearLevel: number;
  currentSubjects: Subject[];
  doneSubjects: Subject[];
  status: 'pending' | 'approved' | 'returned';
}

interface Subject {
  id: string;
  code: string;
  name: string;
  units: number;
  yearLevel: number;
  status: 'pending' | 'approved' | 'removed';
}

const ProgramHeadEnrollment: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedDoneSubjects, setSelectedDoneSubjects] = useState<string[]>([]);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call
      const mockData: Student[] = [
        {
          id: '1',
          name: 'John Doe',
          studentType: 'Freshman',
          yearLevel: 1,
          currentSubjects: [],
          doneSubjects: [],
          status: 'pending',
        },
        // Add more mock data as needed
      ];
      setStudents(mockData);
    } catch (err) {
      setError('Failed to load enrollments');
      console.error('Error loading enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (student: Student) => {
    setSelectedStudent(student);
    setSelectedSubjects(student.currentSubjects.map(subject => subject.id));
    setSelectedDoneSubjects(student.doneSubjects.map(subject => subject.id));
    setIsDialogOpen(true);
  };

  const handleApprove = async () => {
    try {
      // TODO: Implement API call
      toast.success('Enrollment approved successfully');
      setIsDialogOpen(false);
      loadEnrollments();
    } catch (err) {
      toast.error('Failed to approve enrollment');
      console.error('Error approving enrollment:', err);
    }
  };

  const handleReturn = async () => {
    try {
      // TODO: Implement API call
      toast.info('Enrollment returned for revision');
      setIsDialogOpen(false);
      loadEnrollments();
    } catch (err) {
      toast.error('Failed to return enrollment');
      console.error('Error returning enrollment:', err);
    }
  };

  const getStudentTypeColor = (type: string) => {
    switch (type) {
      case 'Freshman': return 'primary';
      case 'Regular': return 'success';
      case 'Irregular': return 'warning';
      case 'Transferee': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'returned': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Enrollment Management
      </Typography>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Year Level</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={student.studentType}
                        color={getStudentTypeColor(student.studentType)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{student.yearLevel}</TableCell>
                    <TableCell>
                      <Chip
                        label={student.status.toUpperCase()}
                        color={getStatusColor(student.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleReview(student)}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Review Enrollment</DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Student Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Name"
                    value={selectedStudent.name}
                    fullWidth
                    disabled
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Type"
                    value={selectedStudent.studentType}
                    fullWidth
                    disabled
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Year Level"
                    value={selectedStudent.yearLevel}
                    fullWidth
                    disabled
                    margin="normal"
                  />
                </Grid>
              </Grid>

              <FormControl fullWidth margin="normal">
                <InputLabel>Subject Assignment</InputLabel>
                <Select
                  multiple
                  value={selectedSubjects}
                  onChange={(e) => setSelectedSubjects(e.target.value as string[])}
                  label="Subject Assignment"
                >
                  {/* TODO: Populate with actual subject list */}
                  <MenuItem value="subject1">Subject 1</MenuItem>
                  <MenuItem value="subject2">Subject 2</MenuItem>
                </Select>
              </FormControl>

              {selectedStudent.studentType === 'Transferee' && (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Completed Subjects</InputLabel>
                  <Select
                    multiple
                    value={selectedDoneSubjects}
                    onChange={(e) => setSelectedDoneSubjects(e.target.value as string[])}
                    label="Completed Subjects"
                  >
                    {/* TODO: Populate with actual subject list */}
                    <MenuItem value="subject1">Subject 1</MenuItem>
                    <MenuItem value="subject2">Subject 2</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReturn} color="warning">
            Return for Revision
          </Button>
          <Button onClick={handleApprove} color="primary" variant="contained">
            Approve Enrollment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProgramHeadEnrollment; 