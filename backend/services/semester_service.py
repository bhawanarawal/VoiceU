from sqlmodel import Session, select
from models.semester import Semester


def sync_semesters(session: Session, program_id: int, total_semesters: int):
    """
    Automatically generate or remove semesters for a program
    based on its total_semesters.
    """
    # Get existing semester numbers
    existing = session.exec(
        select(Semester.semester_number).where(Semester.program_id == program_id)
    ).all()

    existing_set = set(existing)

    # Add missing semesters
    for i in range(1, total_semesters + 1):
        if i not in existing_set:
            session.add(Semester(program_id=program_id, semester_number=i))

    # Remove extra semesters
    extra_semesters = session.exec(
        select(Semester).where(
            Semester.program_id == program_id,
            Semester.semester_number > total_semesters,
        )
    ).all()

    for semester in extra_semesters:
        session.delete(semester)

    session.commit()
