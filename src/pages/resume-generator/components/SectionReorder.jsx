import { Box, Typography } from '@mui/material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SECTION_LABELS = {
  summary: 'Summary',
  experience: 'Experience',
  skills: 'Skills',
  education: 'Education',
  projects: 'Projects',
  certifications: 'Certifications',
  awards: 'Awards',
};

function SortableItem({ id }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <Box
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 0.875,
        mb: 0.75,
        bgcolor: isDragging ? '#EFF6FF' : 'white',
        border: '1px solid',
        borderColor: isDragging ? '#BFDBFE' : '#E5E7EB',
        borderRadius: 1,
        cursor: 'grab',
        '&:active': { cursor: 'grabbing' },
        boxShadow: isDragging ? '0 4px 12px rgba(37,99,235,0.12)' : 'none',
        userSelect: 'none',
      }}
    >
      <Typography sx={{ color: '#9CA3AF', fontSize: '0.9rem', lineHeight: 1, mr: 0.5 }}>⠿</Typography>
      <Typography variant="body2" sx={{ fontFamily: 'var(--font-family)', fontSize: '0.8125rem', color: '#374151', fontWeight: 500 }}>
        {SECTION_LABELS[id] ?? id.charAt(0).toUpperCase() + id.slice(1)}
      </Typography>
    </Box>
  );
}

const DEFAULT_ORDER = ['summary', 'experience', 'skills', 'education', 'projects', 'certifications'];

export default function SectionReorder({ sectionsOrder, onReorder }) {
  const items = (sectionsOrder && sectionsOrder.length > 0) ? sectionsOrder : DEFAULT_ORDER;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((section) => (
          <SortableItem key={section} id={section} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
