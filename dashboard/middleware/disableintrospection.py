from graphql import GraphQLField, GraphQLObjectType, GraphQLSchema, GraphQLString


class IntrospectionDisabledException(Exception):
     """
     Disabling introspection in production mode
     """
     def __init__(self, message="Introspection is disabled."):
        self.message = message
        super().__init__(self.message)

class DisableIntrospectionMiddleware:
    """
    This class hides the introspection.
    """

    def resolve(self, next, root, info, **kwargs):
        if info.field_name.lower() in ['__schema', '_introspection']:
            raise IntrospectionDisabledException
        return next(root, info, **kwargs)

