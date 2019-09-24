import graphene
from dashboard.graphql.query import Query
from dashboard.graphql.mutation import Mutation

schema = graphene.Schema(query=Query, mutation=Mutation)